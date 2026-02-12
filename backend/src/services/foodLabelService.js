import { console } from "inspector";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import {
  createFoodLabelRepository,
  deleteFoodLabelRepository,
  getFoodLabelByIdRepository,
  getFoodLabelByUserIdCatalogIdRepository,
  getLabelSuggestionsRepository,
  getUserFoodLabelsRepository,
  updateFoodLabelWithHistoryRepository,
} from "../repositories/foodLabelRepository.js";
import { determineUpdateValue, isAnyValueDefined, normalizeText } from "../utils/stringUtils.js";

//vraci food label podle id
export const getFoodLabelByIdService = async (foodCatalogId, ownerId, userId, isAdmin) => {
  const userLabel = !isAdmin
    ? await getFoodLabelByUserIdCatalogIdRepository(userId, foodCatalogId)
    : null;

  const originalLabel = await getFoodLabelByUserIdCatalogIdRepository(ownerId, foodCatalogId);

  return mergeLabels(userLabel, originalLabel);
};

// Zpracuje a zvaliduje zmeny food labelu
export const resolveFoodLabelUpdateData = async (userId, catalogId, data) => {
  if (
    data?.labelTitle === undefined &&
    data?.description === undefined &&
    data?.foodImageUrl === undefined
  ) {
    return null;
  }

  // aktualni label
  const userLabel = await getFoodLabelByUserIdCatalogIdRepository(userId, catalogId);

  const currentTitle = userLabel?.title ?? null;
  const currentDescription = userLabel?.description ?? null;
  const currentFoodImageUrl = userLabel?.foodImageUrl ?? null;

  // nove hodnoty
  const newTitle = determineUpdateValue(currentTitle, data?.labelTitle);
  const newDescription = determineUpdateValue(currentDescription, data?.description);
  const newFoodImageUrl = determineUpdateValue(currentFoodImageUrl, data?.foodImageUrl);

  // pokud se nic nemeni vracime null
  if (newTitle === undefined && newDescription === undefined && newFoodImageUrl === undefined) {
    return null;
  }

  return {
    id: userLabel?.id || null,
    new: {
      title: newTitle,
      description: newDescription,
      foodImageUrl: newFoodImageUrl,
    },
    old: {
      title: currentTitle,
    },
  };
};

// updatuje uzivateluv label
export const updateFoodLabelService = async (userId, data, isAdmin) => {
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
  console.log(foodLabel);

  //pokud se nejedna o useruv label pak chce vytvorit svoji upravenou kopii
  if (!isAdmin && foodLabel.userId !== userId) {
    const userFoodLabel = await getFoodLabelByUserIdCatalogIdRepository(
      userId,
      foodLabel.catalogId,
    );

    if (userFoodLabel) {
      foodLabel = userFoodLabel;
    } else {
      const payload = {
        userId: userId,
        catalogId: foodLabel.catalogId,
        title: getCopyValue(data?.title, foodLabel.title),
        description: getCopyValue(data?.description, foodLabel.description),
        foodImageUrl: getCopyValue(data?.foodImageUrl, foodLabel.foodImageUrl),
        price: getCopyValue(data?.price, foodLabel.price) ?? 0,
        unit: getCopyValue(data?.unit, foodLabel.unit),
        amount: getCopyValue(data?.amount, foodLabel.amount) ?? 0,
      };
      return await createFoodLabelRepository(payload);
    }
  }

  const updateLabelData = {
    new: {
      title: determineUpdateValue(foodLabel?.title, data?.title),
      description: determineUpdateValue(foodLabel?.description, data?.description),
      foodImageUrl: determineUpdateValue(foodLabel?.foodImageUrl, data?.foodImageUrl),
      price: determineUpdateValue(foodLabel?.price, data?.price, true),
      unit: determineUpdateValue(foodLabel?.unit, data?.unit),
      amount: determineUpdateValue(foodLabel?.amount, data?.amount, true),
    },
    old: {
      title: foodLabel.title,
    },
  };

  if (!isAnyValueDefined(updateLabelData.new)) {
    console.log("Data provided are identical to current database state.");
    return false;
  }
  return await updateFoodLabelWithHistoryRepository(foodLabel.id, updateLabelData, userId);
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
  process.stdout.write(`Cresult: ${JSON.stringify(result, null, 2)}\n`);
  if (!result || result.length === 0) return [];

  // serazeni labelu
  const sorted = result.sort((a, b) => {
    const aInCurrentInventory = a.foods && a.foods.length > 0;
    const bInCurrentInventory = b.foods && b.foods.length > 0;

    const aHasInstances = a.foods?.some((f) => (f._count?.instances || 0) > 0);
    const bHasInstances = b.foods?.some((f) => (f._count?.instances || 0) > 0);

    const aIsUserLabel = a.userId === userId;
    const bIsUserLabel = b.userId === userId;

    // 1. PRIORITA: Userovi labely v tomto inventari, kde jejich food ma instance
    const aPrio1 = aIsUserLabel && aInCurrentInventory && aHasInstances ? 1 : 0;
    const bPrio1 = bIsUserLabel && bInCurrentInventory && bHasInstances ? 1 : 0;
    if (aPrio1 !== bPrio1) return bPrio1 - aPrio1;

    // 2. PRIORITA: Userovi labely v tomto inventari, kde jejich food nema instance
    const aPrio2 = aIsUserLabel && aInCurrentInventory && !aHasInstances ? 1 : 0;
    const bPrio2 = bIsUserLabel && bInCurrentInventory && !bHasInstances ? 1 : 0;
    if (aPrio2 !== bPrio2) return bPrio2 - aPrio2;

    // 3. PRIORITA: Cizi labely v tomto inventari, kde jejich food ma instance
    const aPrio3 = !aIsUserLabel && aInCurrentInventory && aHasInstances ? 1 : 0;
    const bPrio3 = !bIsUserLabel && bInCurrentInventory && bHasInstances ? 1 : 0;
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
    const aVariantCount = a.foods?.length || 0;
    const bVariantCount = b.foods?.length || 0;

    if (a.title.toLowerCase() === b.title.toLowerCase()) {
      if (aVariantCount !== bVariantCount) {
        return bVariantCount - aVariantCount;
      }
    }

    // 7. FALLBACK: Abeceda
    return a.title.localeCompare(b.title, ["cs", "en"], { sensitivity: "base" });
  });

  // vyfiltruje stejne catalogId a title
  const uniqueSuggestions = [];
  const seenCatalogIds = new Set();
  const seenTitles = new Set();

  for (const item of sorted) {
    const normalizedTitle = normalizeText(item.title);

    const isDuplicateCatalog = seenCatalogIds.has(item.catalogId);
    const isDuplicateTitle = seenTitles.has(normalizedTitle);

    if (!isDuplicateCatalog && !isDuplicateTitle) {
      seenCatalogIds.add(item.catalogId);
      seenTitles.add(normalizedTitle);

      const variants = item.foods
        .filter((f) => f.variant && f.variant.title)
        .map((f) => ({
          variantId: f.variant.id,
          variantTitle: f.variant.title,
        }));

      uniqueSuggestions.push({
        inventoryId: inventoryId,
        catalogId: item.catalogId,
        barcode: item.catalog?.barcode || "",
        title: item?.title || "",
        description: item?.description || "",
        foodImageUrl: item?.foodImageUrl || "",
        price: item?.price || 0,
        unit: item?.unit || "",
        amount: item?.amount || 0,
        variants: variants,
        ...(isAdmin
          ? {
              foodId: item.foods[0]?.id || null,
              userId: item.userId,
              isUserLabel: item.userId === userId,
              hasStock: item.foods?.some((f) => (f._count?.instances || 0) > 0) || false,
              isInInventory: item.foods.length > 0,
            }
          : {}),
      });
    }
    if (uniqueSuggestions.length >= limit) break;
  }
  return uniqueSuggestions;
};
