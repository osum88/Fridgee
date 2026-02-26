import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodCategoriesByInventoryRepository } from "../repositories/foodCategoryRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import {
  createFoodLabelRepository,
  deleteFoodLabelRepository,
  getAvailableFoodLabelsRepository,
  getFoodLabelByIdRepository,
  getFoodLabelByUserIdCatalogIdRepository,
  getLabelSuggestionsRepository,
  getUserFoodLabelsRepository,
  isImageUsedElsewhereRepository,
  updateFoodLabelWithHistoryRepository,
} from "../repositories/foodLabelRepository.js";
import { determineUpdateValue, isAnyValueDefined, normalizeText } from "../utils/stringUtils.js";
import {
  deleteImageFromCloud,
  generateImageFilename,
  resizeImage,
  uploadImageToCloud,
} from "./imageService.js";

// Zpracuje a zvaliduje zmeny food labelu
export const resolveFoodLabelUpdateData = async (userId, catalogId, data) => {
  const inputFields = {
    title: data?.labelTitle,
    description: data?.description,
    foodImageUrl: data?.foodImageUrl,
    foodImageCloudId: data?.foodImageCloudId,
    image: data?.image,
  };

  if (!isAnyValueDefined(inputFields)) {
    return null;
  }

  // aktualni label
  const userLabel = await getFoodLabelByUserIdCatalogIdRepository(userId, catalogId);

  //uploaduje food image na cloud
  const imageData = await uploadFoodLabelImageService(
    userId,
    data?.foodImageUrl,
    data?.image,
    data?.foodImageCloudId,
  );

  const currentTitle = userLabel?.title ?? null;
  const currentDescription = userLabel?.description ?? null;
  const currentFoodImageUrl = userLabel?.foodImageUrl ?? null;
  const currentFoodImageCloudId = userLabel?.foodImageCloudId ?? null;

  // nove hodnoty
  const newData = {
    title: determineUpdateValue(currentTitle, data?.labelTitle),
    description: determineUpdateValue(currentDescription, data?.description),
    foodImageUrl: determineUpdateValue(currentFoodImageUrl, imageData?.foodImageUrl),
    foodImageCloudId: determineUpdateValue(currentFoodImageCloudId, imageData?.foodImageCloudId),
  };

  // pokud se nic nemeni vracime null
  if (!isAnyValueDefined(newData)) {
    return null;
  }

  return {
    id: userLabel?.id || null,
    new: newData,
    old: {
      title: currentTitle,
      foodImageCloudId: currentFoodImageCloudId,
    },
  };
};

// updatuje uzivateluv label
export const updateFoodLabelService = async (userId, data, isAdmin) => {
  let imageData = null;
  try {
    const { foodLabelId, ...updateData } = data;

    if (!isAnyValueDefined(updateData)) {
      console.log("No fields provided for update.");
      return false;
    }

    const getCopyValue = (provided, original) => {
      if (provided === undefined) return original;
      if (provided === "") return null;
      return provided;
    };

    let foodLabel = await getFoodLabelByIdRepository(foodLabelId);
    let isUserLabel = isAdmin || foodLabel.userId === userId;

    //pokud se nejedna o useruv label pak chce vytvorit svoji upravenou kopii
    if (!isUserLabel) {
      const userFoodLabel = await getFoodLabelByUserIdCatalogIdRepository(
        userId,
        foodLabel.catalogId,
      );
      if (userFoodLabel) {
        isUserLabel = true;
        foodLabel = userFoodLabel;
      }
    }

    //updatuje food image na cloudu
    imageData = await uploadFoodLabelImageService(
      userId,
      data?.foodImageUrl,
      data?.image,
      data?.foodImageCloudId,
    );

    // vytvori uzivatelskou kopii pokud neexistuje
    if (!isUserLabel) {
      const payload = {
        userId: userId,
        catalogId: foodLabel.catalogId,
        title: getCopyValue(data?.title, foodLabel.title),
        description: getCopyValue(data?.description, foodLabel.description),
        foodImageUrl: getCopyValue(imageData?.foodImageUrl, foodLabel?.foodImageUrl),
        foodImageCloudId: getCopyValue(imageData?.foodImageCloudId, foodLabel?.foodImageCloudId),
        price: getCopyValue(data?.price, foodLabel.price) ?? 0,
        unit: getCopyValue(data?.unit, foodLabel.unit),
        amount: getCopyValue(data?.amount, foodLabel.amount) ?? 0,
      };
      return await createFoodLabelRepository(payload);
    }

    // jinak updatuje stara data
    const updateLabelData = {
      new: {
        title: determineUpdateValue(foodLabel?.title, data?.title),
        description: determineUpdateValue(foodLabel?.description, data?.description),
        foodImageUrl: determineUpdateValue(foodLabel?.foodImageUrl, imageData?.foodImageUrl),
        foodImageCloudId: determineUpdateValue(
          foodLabel?.foodImageCloudId,
          imageData?.foodImageCloudId,
        ),
        price: determineUpdateValue(foodLabel?.price, data?.price, true),
        unit: determineUpdateValue(foodLabel?.unit, data?.unit),
        amount: determineUpdateValue(foodLabel?.amount, data?.amount, true),
      },
      old: {
        title: foodLabel.title,
        foodImageCloudId: foodLabel?.foodImageCloudId,
      },
    };

    if (!isAnyValueDefined(updateLabelData.new)) {
      console.log("Data provided are identical to current database state.");
      return false;
    }
    const result = await updateFoodLabelWithHistoryRepository(
      foodLabel.id,
      updateLabelData,
      userId,
    );

    // smaze fotku z cloudu
    const isImageChanged =
      imageData.foodImageUrl !== undefined && imageData.foodImageCloudId !== undefined;

    if (isUserLabel && foodLabel?.foodImageCloudId && isImageChanged) {
      await cleanupUnusedImage(foodLabel.foodImageCloudId);
    }
    return result;
  } catch (error) {
    if (imageData?.foodImageCloudId && imageData.foodImageCloudId !== data?.foodImageCloudId) {
      deleteImageFromCloud(imageData.foodImageCloudId).catch((err) =>
        console.error("Rollback cleanup failed:", err),
      );
    }
    throw error;
  }
};

// zontroluje, zda je obrazek v cloudu jeste nekde pouzivan
export const cleanupUnusedImage = async (foodImageCloudId) => {
  if (!foodImageCloudId) return;
  try {
    const isStillUsed = await isImageUsedElsewhereRepository(foodImageCloudId);

    if (!isStillUsed) {
      deleteImageFromCloud(foodImageCloudId).catch((err) =>
        console.error("Cleanup of image failed:", err),
      );
    } else {
      console.log(
        `Image ${foodLabel?.foodImageCloudId} is still referenced elsewhere. Skipping deletion.`,
      );
    }
  } catch (error) {
    console.error(`Error checking usage for cloudId ${foodImageCloudId}:`, error);
  }
};

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
export const deleteFoodLabelService = async (labelId, userId, isAdmin) => {
  const foodLabel = await getFoodLabelByIdRepository(labelId, true);
  if (!isAdmin && foodLabel.userId !== userId) {
    throw new ForbiddenError("You do not have permission to delete this label.");
  }
  return await deleteFoodLabelRepository(labelId, userId, isAdmin);
};

//hleda jidlo podle stringu
export const getLabelSuggestionsService = async (
  userId,
  inventoryId,
  searchString,
  limit,
  isAdmin,
) => {
  if (!inventoryId || inventoryId === "null") {
    return getUserFoodLabelsRepository(userId, searchString, limit);
  }
  // kontrola jestli je uzivatel v inventari
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }

  const result = await getLabelSuggestionsRepository(userId, inventoryId, searchString, limit);
  console.log(result);
  if (!result || result.length === 0) return [];

  // serazeni labelu
  const sorted = result.sort((a, b) => {
    const aInventoryFoods = a.catalog?.foods || [];
    const bInventoryFoods = b.catalog?.foods || [];

    const aInCurrentInventory = aInventoryFoods.length > 0;
    const bInCurrentInventory = bInventoryFoods.length > 0;

    const aHasInstances = aInventoryFoods.some((f) => (f._count?.instances || 0) > 0);
    const bHasInstances = bInventoryFoods.some((f) => (f._count?.instances || 0) > 0);

    const aIsUserLabel = a.userId === userId;
    const bIsUserLabel = b.userId === userId;

    // 1. PRIORITA: Userovi labely v tomto inventari, kde jejich food ma instance
    const aPrio1 = aIsUserLabel && aHasInstances ? 1 : 0;
    const bPrio1 = bIsUserLabel && bHasInstances ? 1 : 0;
    if (aPrio1 !== bPrio1) return bPrio1 - aPrio1;

    // 2. PRIORITA: Userovi labely v tomto inventari, kde jejich food nema instance
    const aPrio2 = aIsUserLabel && aInCurrentInventory ? 1 : 0;
    const bPrio2 = bIsUserLabel && bInCurrentInventory ? 1 : 0;
    if (aPrio2 !== bPrio2) return bPrio2 - aPrio2;

    // 3. PRIORITA: Cizi labely v tomto inventari, kde jejich food ma instance
    const aPrio3 = !aIsUserLabel && aHasInstances ? 1 : 0;
    const bPrio3 = !bIsUserLabel && bHasInstances ? 1 : 0;
    if (aPrio3 !== bPrio3) return bPrio3 - aPrio3;

    // 4. PRIORITA: Cizi labely v tomto inventari, kde jejich food nema instance, ale catalog ma barcode
    const aHasBarcode = a.catalog?.barcode !== null;
    const bHasBarcode = b.catalog?.barcode !== null;
    const aPrio4 = aInCurrentInventory && aHasBarcode ? 1 : 0;
    const bPrio4 = bInCurrentInventory && bHasBarcode ? 1 : 0;
    if (aPrio4 !== bPrio4) return bPrio4 - aPrio4;

    // 5. PRIORITA: Userovi labely, ktere nejsou v inventari
    if (aIsUserLabel !== bIsUserLabel) return bIsUserLabel - aIsUserLabel;

    // 6. PRIORITA: Pocet unikatnich variant (pokud se nazvy shoduji)
    if (
      a.title.toLowerCase() === b.title.toLowerCase() &&
      aInventoryFoods.length !== bInventoryFoods.length
    ) {
      return bInventoryFoods.length - aInventoryFoods.length;
    }

    // 7. FALLBACK: Abeceda
    return a.title.localeCompare(b.title, ["cs", "en"], { sensitivity: "base" });
  });

  const uniqueSuggestions = [];
  const seenCatalogIds = new Set();
  const seenTitles = new Set();

  //deduplikace catalogId a stejnych nazvu
  for (const item of sorted) {
    const normalizedTitle = normalizeText(item.title);

    const isDuplicateCatalog = seenCatalogIds.has(item.catalogId);
    const isDuplicateTitle = seenTitles.has(normalizedTitle);

    if (!isDuplicateCatalog && !isDuplicateTitle) {
      seenCatalogIds.add(item.catalogId);
      seenTitles.add(normalizedTitle);

      const inventoryFoods = item.catalog?.foods || [];

      const variants = inventoryFoods
        .filter((f) => f.variant && f.variant.title)
        .map((f) => ({
          variantId: f.variant.id,
          variantTitle: f.variant.title,
        }));

      const existingItems = inventoryFoods.map((f) => ({
        variantId: f.variant?.id || null,
        categoryId: f.category?.id || null,
        categoryTitle: f.category?.title || "",
      }));

      uniqueSuggestions.push({
        inventoryId: inventoryId,
        catalogId: item.catalogId,
        barcode: item.catalog?.barcode || "",
        title: item?.title || "",
        description: item?.description || "",
        foodImageUrl: item?.foodImageUrl || "",
        foodImageCloudId: item?.foodImageCloudId || "",
        price: item?.price || 0,
        unit: item?.unit || "",
        amount: item?.amount || 0,
        existingItems,
        variants: variants,
        ...(isAdmin
          ? {
              isUserLabel: item.userId === userId,
              foodId: inventoryFoods[0]?.id || null, 
              userId: item.userId,
              hasStock: inventoryFoods.some((f) => (f._count?.instances || 0) > 0) || false,
              isInInventory: inventoryFoods.length > 0, 
            }
          : {}),
      });
    }
    if (uniqueSuggestions.length >= limit) break;
  }
  return uniqueSuggestions;
};

// uploaduje fotku na cloud
export const uploadFoodLabelImageService = async (
  userId,
  foodImageUrl,
  image,
  foodImageCloudId,
) => {
  if (image) {
    try {
      const IMAGE_SIZE = 350;
      //zmensi fotku
      const foodImageBuffer = await resizeImage(image, IMAGE_SIZE, "webp");

      //vytvori nazev
      const filename = generateImageFilename(
        "catalog",
        userId,
        IMAGE_SIZE,
        IMAGE_SIZE,
        "webp",
        false,
      );

      //uploaduje fotku na cloud
      const result = await uploadImageToCloud(
        foodImageBuffer,
        filename,
        `/catalogs/user${userId}`,
        [`catalog`, `user-${userId}`],
        false,
        true,
      );

      if (result) {
        const updateTime = Math.floor(Date.now() / 1000);
        return {
          foodImageUrl: `${result.filePath}?v=${updateTime}`,
          foodImageCloudId: result.fileId,
        };
      }
    } catch (err) {
      console.error("Upload failed, attempting to fallback to recycling:", err);
    }
  }
  if (foodImageUrl === null || foodImageUrl === "") {
    return {
      foodImageUrl: null,
      foodImageCloudId: null,
    };
  }
  if (foodImageCloudId && foodImageUrl) {
    const labelByCloudId = await isImageUsedElsewhereRepository(foodImageCloudId);

    // pokud id existuje a url odpovida recyklujeme
    if (labelByCloudId && labelByCloudId.foodImageUrl === foodImageUrl) {
      return {
        foodImageUrl: foodImageUrl,
        foodImageCloudId: foodImageCloudId,
      };
    }
  }
  return {
    foodImageUrl: undefined,
    foodImageCloudId: undefined,
  };
};

//vrati vsechny userovi labely a vsechny co se pouzivaji v neajkem inventari
export const getAvailableFoodLabelsService = async (userId, page = 1, limit = 20) => {
  const pageIndex = Math.max(0, page - 1);
  const safeLimit = Math.max(1, Math.min(limit, 500));

  const labels = await getAvailableFoodLabelsRepository(userId, pageIndex, safeLimit);

  return {
    items: labels,
    page: page,
    limit: safeLimit,
    count: labels.length,
    hasNextPage: labels.length === safeLimit,
  };
};
