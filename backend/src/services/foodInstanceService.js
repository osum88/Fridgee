import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError, UnauthorizedError } from "../errors/errors.js";
import {
  consumeMultipleFoodInstancesRepository,
  getFoodInstancesWithPriceRepository,
  getInventoryIdsByInstanceIdsRepository,
  updateFoodInstancesRepository,
} from "../repositories/foodInstanceRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import {
  determineUpdateValue,
  formatToISODate,
  normalizeDate,
} from "../utils/stringUtils.js";
import { resolveVariantUpdateData } from "./foodVariantService.js";
import { resolvePriceExchangeData } from "./priceService.js";

// smaze vice foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeMultipleFoodInstancesService = async (userId, data, isAdmin) => {
  const foodInstancesIds = Array.isArray(data.foodInstanceId)
    ? data.foodInstanceId
    : [data.foodInstanceId];

  const MAX_BULK_CONSUME = 50;
  if (foodInstancesIds.length > MAX_BULK_CONSUME) {
    throw new BadRequestError(
      `Bulk consume limit exceeded. Maximum allowed is ${MAX_BULK_CONSUME} items, but ${foodInstancesIds.length} were selected.`,
    );
  }

  //kontrola existence instanci v invenatri
  const inventoryIds = await getInventoryIdsByInstanceIdsRepository(foodInstancesIds);
  if (inventoryIds.length > 1) {
    throw new BadRequestError("Bulk consume is only allowed for the same inventory.");
  }
  //kontrola opravneni pro kazdou instanci jestli patri do userova inventare
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryIds[0]);
  }
  const amountToConsume = data?.amountToConsume || 0;
  const result = await consumeMultipleFoodInstancesRepository(
    userId,
    foodInstancesIds,
    amountToConsume,
  );
  return result;
};

//updatuje jednu nebo vice stejnych instanci
export const updateFoodInstanceService = async (userId, data, isAdmin) => {
  const foodInstancesIds = Array.isArray(data.foodInstanceId)
    ? data.foodInstanceId
    : [data.foodInstanceId];

  const MAX_BULK_UPDATE = 50;
  if (!isAdmin && foodInstancesIds.length > MAX_BULK_UPDATE) {
    throw new BadRequestError(
      `Bulk update limit exceeded. Maximum allowed is ${MAX_BULK_UPDATE} items, but ${foodInstancesIds.length} were selected.`,
    );
  }

  //kontrola existence instanci v invenatri
  const inventoryIds = await getInventoryIdsByInstanceIdsRepository(foodInstancesIds);
  if (inventoryIds.length > 1) {
    throw new BadRequestError("Bulk update is only allowed for the same inventory.");
  }
  const inventoryId = inventoryIds[0];

  //kontrola opravneni pro kazdou instanci jestli patri do userova inventare
  const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
  if (!isAdmin && !inventoryUser) {
    throw new NotFoundError("User not found in inventory");
  }

  //ziskame vsechny inventare s cenami
  const instances = await getFoodInstancesWithPriceRepository(foodInstancesIds);
  const uniqueFoodIds = [...new Set(instances.map((inst) => inst.foodId))];
  if (uniqueFoodIds.length > 1) {
    throw new BadRequestError("Bulk update is only allowed for the same type of food.");
  }
  const foodId = uniqueFoodIds[0];

  const parsedPrice = data?.price !== undefined ? parseFloat(data?.price) : undefined;


  //zpracuje a zvaliduje zmeny varianty potraviny a vrati data pro update nebo null
  const variantData = await resolveVariantUpdateData(
    data.variantId,
    data.variantTitle,
    foodId,
    userId,
    isAdmin,
    inventoryUser,
  );

  const updatePayload = [];
  const dateCache = new Map();

  for (const instance of instances) {
    // vychozi stav nemenime cenu
    let priceData = undefined;
    //pokud ma price stejnou hodnotu a stejnou menu pak se nemusi vytvaret
    const isSamePrice = instance.price?.price === parsedPrice;
    const isSameCurrency = instance.price?.baseCurrency === data?.currency;

    //smazeme cenu
    if (parsedPrice === 0) {
      priceData = null;
      //jinak vytvorime paylodad pro novou price
    } else if (parsedPrice > 0 && (!isSamePrice || !isSameCurrency)) {
      const isoDate = formatToISODate(instance.price?.exchangeRateDate || instance.createdAt);
      if (!dateCache.has(isoDate)) {
        const currency = data?.currency || instance.price?.baseCurrency;
        priceData = await resolvePriceExchangeData(parsedPrice, currency, userId, isoDate);
        dateCache.set(isoDate, priceData);
      }
      priceData = dateCache.get(isoDate);
    }

    const expiration = normalizeDate(data?.expirationDate);
    const amount = data?.amount !== undefined ? parseInt(data.amount) : undefined;

    updatePayload.push({
     
      instanceId: instance.id,
      // data pro update instance
      instanceData: {
        amount: determineUpdateValue(instance?.amount, amount),
        unit: determineUpdateValue(instance?.unit, data?.unit),
        expirationDate: determineUpdateValue(instance?.expirationDate, expiration),
      },
      // data pro cenu
      priceData,
      // data pro hisotrii
      oldData: {
        amount: instance.amount,
        unit: instance.unit,
        expirationDate: instance.expirationDate,
        priceId: instance.priceId,
      },
    });
  }
  return await updateFoodInstancesRepository(userId, updatePayload, foodId, variantData);
};
