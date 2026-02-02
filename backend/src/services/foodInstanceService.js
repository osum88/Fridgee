import { consumeFoodInstanceRepository, getInventoryIdByInstanceId } from "../repositories/foodInstanceRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeFoodInstanceService = async (userId, data, isAdmin) => {
  //kontrola existence instance
  const inventoryId = await getInventoryIdByInstanceId(data.foodInstanceId);
  //kontrola opravneni
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }
  const amountToConsume = data?.amountToConsume || 0;

  const result = await consumeFoodInstanceRepository(userId, data.foodInstanceId, amountToConsume);
  return result;
};
