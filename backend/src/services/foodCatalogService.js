import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodCatalogWithLabelByBarcodeRepository } from "../repositories/foodCatalogRepository.js";
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

  let activeVariants = [];
  if (currentInventoryId && currentInventoryId !== "null") {
    activeVariants = await getActiveFoodVariantsRepository(catalogWithLabel.id, currentInventoryId);
  }

  // vezme useruv lebel, pokud neni tak ten v inventari
  const activeLabel = catalogWithLabel?.labels[0] || catalogWithLabel?.foods[0]?.label || {};

  return {
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
    variants: activeVariants,
    ...(isAdmin
      ? {
          foodId: catalogWithLabel.foods[0]?.id || null,
          userId: catalogWithLabel.addedBy,
          isUserLabel: catalogWithLabel.addedBy === userId,
          isInInventory: catalogWithLabel?.foods?.length > 0,
        }
      : {}),
  };
};
