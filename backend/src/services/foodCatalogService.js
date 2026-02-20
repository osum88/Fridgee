import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodCatalogWithLabelByBarcodeRepository } from "../repositories/foodCatalogRepository.js";
import { getFoodCategoriesByInventoryRepository } from "../repositories/foodCategoryRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import { getActiveFoodVariantsRepository } from "../repositories/foodVariantRepository.js";

// vrati katalog, label a variant podle barcodu
export const getFoodCatalogWithLabelByBarcodeService = async (
  barcode,
  inventoryId,
  userId,
  isAdmin,
) => {
  let currentInventoryId = inventoryId;
  //overi ze user patri do invenatre, jinak hleda bez inventoryId
  if (!isAdmin && currentInventoryId) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, currentInventoryId, false);
    if (!inventoryUser) {
      currentInventoryId = null;
    }
  }
  //vrati catalog a label
  const catalogWithLabel = await getFoodCatalogWithLabelByBarcodeRepository(
    barcode,
    currentInventoryId,
    userId,
  );
  if (!catalogWithLabel) return null;

  const existingFoods = catalogWithLabel?.foods || [];

  let activeVariants = [];
  if (currentInventoryId && currentInventoryId !== "null") {
    activeVariants = await getActiveFoodVariantsRepository(catalogWithLabel.id, currentInventoryId);
  }

  const allCategories = currentInventoryId
    ? await getFoodCategoriesByInventoryRepository(currentInventoryId)
    : [];

  // vezme useruv lebel, pokud neni tak ten v inventari
  const activeLabel = catalogWithLabel?.labels[0] || existingFoods[0]?.label || {};

  return {
    categories: allCategories,
    foods: {
      inventoryId: currentInventoryId,
      catalogId: catalogWithLabel.id,
      barcode: catalogWithLabel.barcode,
      title: activeLabel?.title || "",
      description: activeLabel?.description || "",
      foodImageUrl: activeLabel?.foodImageUrl || "",
      foodImageCloudId: activeLabel?.foodImageCloudId || null,
      price: activeLabel?.price || 0,
      unit: activeLabel?.unit || "",
      amount: activeLabel?.amount || 0,
      existingItems: existingFoods.map((f) => ({
        variantId: f.variant?.id || null,
        categoryId: f.category?.id || null,
        categoryTitle: f.category?.title || "",
      })),
      variants: activeVariants,
      ...(isAdmin
        ? {
            foodId: catalogWithLabel.foods[0]?.id || null,
            userId: catalogWithLabel.addedBy,
            isUserLabel: catalogWithLabel.addedBy === userId,
            isInInventory: catalogWithLabel?.foods?.length > 0,
          }
        : {}),
    },
  };
};
