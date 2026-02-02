import { ConflictError } from "../errors/errors.js";
import { getFoodCatalogByIdRepository } from "../repositories/foodCatalogRepository.js";
import { getFoodCategoryByIdRepository } from "../repositories/foodCategoryRepository.js";
import {
  getFoodInventoryRepository,
  isUserInFoodInventoryRepository,
} from "../repositories/foodInventoryRepository.js";
import { addFoodToInventoryRepository } from "../repositories/foodRepository.js";
import { getFoodVariantByIdRepository } from "../repositories/foodVariantRepository.js";
import { cleanEmptyStrings } from "../utils/cleanEmptyStrings.js";
import { createPriceDataService } from "./priceService.js";

// prida jidlo do inventare a vytvori instanci, price i history
export const addFoodToInventoryService = async (userId, foodData, isAdmin) => {

  //kontrola existence ids
  await getFoodInventoryRepository(foodData?.inventoryId);

  if (foodData?.categoryId) {
    await getFoodCategoryByIdRepository(foodData?.categoryId);
  }
  if (foodData?.catalogId) {
    await getFoodCatalogByIdRepository(foodData?.catalogId);
  }
  if (foodData?.variantId) {
    await getFoodVariantByIdRepository(foodData?.variantId);
  }

  // kontrola jestli je uzivatel v inventari
  const existingInventoryUser = await isUserInFoodInventoryRepository(
    userId,
    foodData?.inventoryId,
  );
  if (!isAdmin && !existingInventoryUser) {
    throw new ConflictError("User is not in this inventory.");
  }

  // vyfiltruje null/undefined
  const { title, description, foodImageUrl, barcode, ...filteredUpdateData } =
    Object.fromEntries(
      Object.entries(foodData).filter(([_, value]) => value != null),
    );
  //nahradi prazdne stringy null
  const finalData = cleanEmptyStrings(filteredUpdateData);

  const parsedPrice = parseFloat(finalData?.price) || 0;

  let priceFields = {};
  if (parsedPrice > 0) {
    const priceData = await createPriceDataService(
      parsedPrice,
      finalData.currency,
      userId,
    );
    priceFields = { ...priceData };
  }

  const preparedData = {
    ...finalData,
    ...priceFields,
    title,
    description,
    foodImageUrl,
    barcode,
    quantity: parseInt(finalData?.quantity) || 1,
    expirationDate: finalData.expirationDate
      ? new Date(finalData.expirationDate)
      : null,
    amount: finalData.amount ? parseFloat(finalData.amount) : null,
  };

  const result = await addFoodToInventoryRepository(userId, preparedData);
  return result;
};
