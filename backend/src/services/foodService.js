import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodCatalogByIdRepository } from "../repositories/foodCatalogRepository.js";
import { getFoodCategoryByIdRepository } from "../repositories/foodCategoryRepository.js";
import {
  getFoodInventoryRepository,
  getFoodInventoryUserRepository,
} from "../repositories/foodInventoryRepository.js";
import {
  addFoodToInventoryRepository,
  getFoodByIdRepository,
  updateFoodRepository,
} from "../repositories/foodRepository.js";
import { cleanEmptyStrings } from "../utils/cleanEmptyStrings.js";
import { determineUpdateValue, normalizeDate } from "../utils/stringUtils.js";
import { resolveCategoryUpdateData } from "./foodCategoryService.js";
import {
  cleanupUnusedImage,
  resolveFoodLabelUpdateData,
  uploadFoodLabelImageService,
} from "./foodLabelService.js";
import { resolveVariantUpdateData } from "./foodVariantService.js";
import { resolvePriceExchangeData } from "./priceService.js";

// prida jidlo do inventare a vytvori instanci, price i history, pokd neexistuje tak i catalog, label, variant
export const addFoodToInventoryService = async (userId, foodData, isAdmin) => {
  let imageData = null;
  try {
    //kontrola existence ids
    await getFoodInventoryRepository(foodData?.inventoryId);
    if (foodData?.categoryId) {
      await getFoodCategoryByIdRepository(foodData?.categoryId);
    }
    if (foodData?.catalogId) {
      await getFoodCatalogByIdRepository(foodData?.catalogId);
    }

    // kontrola jestli je uzivatel v inventari
    if (!isAdmin) {
      await getFoodInventoryUserRepository(userId, foodData?.inventoryId);
    }

    //uploaduje food image na cloud
    imageData = await uploadFoodLabelImageService(
      userId,
      foodData?.foodImageUrl,
      foodData?.image,
      foodData?.foodImageCloudId,
    );

    // vyfiltruje null/undefined
    const { title, description, barcode, expirationDate, ...filteredUpdateData } =
      Object.fromEntries(Object.entries(foodData).filter(([_, value]) => value != null));

    //nahradi prazdne stringy null
    const finalData = cleanEmptyStrings(filteredUpdateData);

    const parsedPrice = parseFloat(finalData?.price) || 0;

    //pripravi data pro price
    let priceFields = {};
    if (parsedPrice > 0) {
      const priceData = await resolvePriceExchangeData(parsedPrice, finalData.currency, userId);
      priceFields = { ...priceData };
    }

    const preparedData = {
      ...finalData,
      ...priceFields,
      title,
      description,
      foodImageUrl: imageData?.foodImageUrl,
      foodImageCloudId: imageData?.foodImageCloudId,
      barcode,
      quantity: parseInt(finalData?.quantity) || 1,
      expirationDate: normalizeDate(expirationDate),
      amount: finalData.amount ? parseFloat(finalData.amount) : 0,
    };

    const { oldImageCloudId, instances } = await addFoodToInventoryRepository(userId, preparedData);

    //smaze starou fotku
    if (oldImageCloudId) {
      await cleanupUnusedImage(oldImageCloudId);
    }
    return instances;
  } catch (error) {
    if (imageData?.foodImageCloudId && imageData.foodImageCloudId !== foodData.foodImageCloudId) {
      deleteImageFromCloud(imageData.foodImageCloudId).catch((err) =>
        console.error("Rollback cleanup failed:", err),
      );
    }
    throw error;
  }
};

export const updateFoodService = async (userId, data, isAdmin) => {
  let labelData = null;
  try {
    const { foodId, ...restData } = data;

    const food = await getFoodByIdRepository(foodId);

    //kontrola opravneni pro kazdou instanci jestli patri do userova inventare
    const inventoryUser = await getFoodInventoryUserRepository(userId, food.inventoryId, false);
    if (!isAdmin && !inventoryUser) {
      throw new NotFoundError("User not found in inventory");
    }
    //zpracuje a zvaliduje zmeny varianty potraviny a vrati data pro update nebo null
    const variantData = await resolveVariantUpdateData(
      data.variantId,
      data.variantTitle,
      foodId,
      userId,
      isAdmin,
      inventoryUser,
      true,
    );

    //zpracuje a zvaliduje zmeny kategorii a vrati data pro update nebo null
    const categoryData = await resolveCategoryUpdateData(
      data.categoryId,
      data.categoryTitle,
      foodId,
      userId,
      isAdmin,
      inventoryUser,
      food.inventoryId,
    );

    labelData = await resolveFoodLabelUpdateData(userId, food?.catalogId, data);

    let minimalQuantityData = null;
    if (data?.minimalQuantity !== undefined) {
      const inputMinQty = data.minimalQuantity !== null ? parseInt(data.minimalQuantity) : 0;

      const newMinimalQuantity = determineUpdateValue(food?.minimalQuantity ?? 0, inputMinQty);

      // pokud se hodnota lisy
      if (newMinimalQuantity !== undefined) {
        if (!isAdmin && !["OWNER", "EDITOR"].includes(inventoryUser?.role)) {
          throw new ForbiddenError("Only OWNER or EDITOR can change minimal quantity.");
        }
        minimalQuantityData = {
          new: { minimalQuantity: newMinimalQuantity },
          old: { minimalQuantity: food?.minimalQuantity },
        };
      }
    }
    const result = await updateFoodRepository(
      foodId,
      userId,
      variantData,
      categoryData,
      labelData,
      minimalQuantityData,
    );

    //konstola jestli se fotka zmenila muzem smazat starou
    const isImageChanged = labelData?.new && "foodImageUrl" in labelData.new;

    if (isImageChanged && labelData?.old?.foodImageCloudId) {
      await cleanupUnusedImage(labelData?.old?.foodImageCloudId);
    }
    return result;
  } catch (error) {
    if (
      labelData?.new?.foodImageCloudId &&
      labelData?.new?.foodImageCloudId !== labelData?.old?.foodImageCloudId
    ) {
      deleteImageFromCloud(labelData.new.foodImageCloudId).catch((err) =>
        console.error("Rollback cleanup failed:", err),
      );
    }
    throw error;
  }
};
