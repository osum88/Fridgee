import { ConflictError } from "../errors/errors.js";
import { getFoodCatalogByIdRepository } from "../repositories/foodCatalogRepository.js";
import { getFoodCategoryByIdRepository } from "../repositories/foodCategoryRepository.js";
import {
  getFoodInventoryRepository,
  getFoodInventoryUserRepository,
} from "../repositories/foodInventoryRepository.js";
import { addFoodToInventoryRepository } from "../repositories/foodRepository.js";
import { getFoodVariantByIdRepository } from "../repositories/foodVariantRepository.js";
import { cleanEmptyStrings } from "../utils/cleanEmptyStrings.js";
import { normalizeDate } from "../utils/stringUtils.js";
import { resolvePriceExchangeData } from "./priceService.js";

// prida jidlo do inventare a vytvori instanci, price i history, pokd neexistuje tak i catalog, label, variant
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
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, foodData?.inventoryId);
  }

  // vyfiltruje null/undefined
  const { title, description, foodImageUrl, barcode, expirationDate, ...filteredUpdateData } =
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
    foodImageUrl,
    barcode,
    quantity: parseInt(finalData?.quantity) || 1,
    expirationDate: normalizeDate(expirationDate),
    amount: finalData.amount ? parseFloat(finalData.amount) : null,
  };

  const result = await addFoodToInventoryRepository(userId, preparedData);
  return result;
};
