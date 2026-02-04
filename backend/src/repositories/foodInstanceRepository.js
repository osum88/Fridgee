import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// smaze vice foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeMultipleFoodInstancesRepository = async (
  userId,
  foodInstanceIds,
  amountToConsume = 0,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingInstances = await tx.foodInstance.findMany({
        where: { id: { in: foodInstanceIds } },
        include: { food: true },
      });

      // pokud neexistuje ani jedna, vyhodi chybu
      if (existingInstances.length === 0) {
        throw new NotFoundError("None of the provided Food Instances were found.");
      }

      const results = [];
      //pokud je vice instanci
      const batchItem = existingInstances.length > 1 ? {} : { batchItem: true };

      //zpracujeme ty co jsme nasli
      for (const instance of existingInstances) {
        // zamkne food radek pro ostatni zapisy dokud neskonci transakce
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${instance.foodId} FOR UPDATE`;

        // aktualizace amount (castecna konzumace) nebo odstraneni instace (uplna konzumace)
        const isFullConsumption = !amountToConsume || instance.amount - amountToConsume <= 0;
        const newAmount = isFullConsumption ? 0 : instance.amount - amountToConsume;

        if (isFullConsumption) {
          await tx.foodInstance.delete({ where: { id: instance.id } });
        } else {
          await tx.foodInstance.update({
            where: { id: instance.id },
            data: { amount: newAmount },
          });
        }

        //vrati pocet instanci foodu v inventari
        const currentCount = await tx.foodInstance.count({ where: { foodId: instance.foodId } });

        // zapis do hisotrie
        const history = await tx.foodHistory.create({
          data: {
            inventoryId: instance.food.inventoryId,
            foodId: instance.foodId,
            foodInstanceId: 0 === newAmount ? null : instance.id,
            catalogId: instance.food.catalogId,
            priceId: instance.priceId,
            action: "CONSUME",
            snapshotUnit: instance.unit,
            snapshotAmount: amountToConsume || instance.amount,
            quantityBefore: currentCount + (isFullConsumption ? 1 : 0),
            quantityAfter: currentCount,
            changedBy: userId,
            metadata:
              0 === newAmount
                ? { fullConsumption: isFullConsumption, ...batchItem }
                : { amount: { before: instance?.amount, after: newAmount }, ...batchItem },
          },
        });
        results.push(history);
      }

      return results;
    });
  } catch (error) {
    console.error("Error consume food instance:", error);
    throw error;
  }
};

// vraci instanci s food s veskerymi infomarmacemi
export const getFoodInstanceInfoByIdRepository = async (foodInstanceId, throwError = true) => {
  try {
    const foodInstance = await prisma.foodInstance.findUnique({
      where: { id: foodInstanceId },
      include: {
        food: {
          include: {
            catalog: true,
            defaultLabel: true,
            variant: true,
          },
        },
      },
    });

    if (!foodInstance) {
      if (throwError) {
        throw new NotFoundError("Food instance not found.");
      }
      return null;
    }
    return foodInstance;
  } catch (error) {
    console.error("Error fetching food instance with food:", error);
    throw error;
  }
};

// vraci id inventare podle id instance
export const getInventoryIdByInstanceIdRepository = async (foodInstanceId, throwError = true) => {
  try {
    const instance = await prisma.foodInstance.findUnique({
      where: { id: foodInstanceId },
      select: {
        food: {
          select: { inventoryId: true },
        },
      },
    });

    if (!instance && throwError) {
      throw new NotFoundError("Food instance not found.");
    }

    return instance?.food?.inventoryId || null;
  } catch (error) {
    console.error("Error fetching inventory id by food instance id:", error);
    throw error;
  }
};

// vraci ids pro veschny inventare podle ids instance
export const getInventoryIdsByInstanceIdsRepository = async (ids, throwError = true) => {
  try {
    const instances = await prisma.foodInstance.findMany({
      where: {
        id: { in: ids },
      },
      select: {
        food: {
          select: { inventoryId: true },
        },
      },
    });

    if (instances.length === 0) {
      if (throwError) {
        throw new NotFoundError("No valid food instances found for the provided IDs.");
      }
      return [];
    }

    const uniqueInventoryIds = [...new Set(instances.map((i) => i.food.inventoryId))];

    return uniqueInventoryIds;
  } catch (error) {
    console.error("Error fetching inventory ids by food instance ids:", error);
    throw error;
  }
};

// Vyhleda a vrati všechny instance ze seznamu ID, s jejich cenou
export const getFoodInstancesWithPriceRepository = async (ids) => {
  try {
    return await prisma.foodInstance.findMany({
      where: {
        id: { in: ids },
      },
      include: {
        price: {},
      },
    });
  } catch (error) {
    console.error("Error fetching instances with price:", error);
    throw error;
  }
};

//updatuje jednu nebo vice stejnych instanci
export const updateFoodInstancesRepository = async (userId,updatePayload) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const results = [];

      for (const item of updatePayload) {
        //konotrla jestli je potreba neco menit
        const hasInstanceChanges = Object.values(item.instanceData).some(
          (val) => val !== undefined,
        );
        const hasPriceChanges = item.priceData !== undefined;
        if (!hasInstanceChanges && !hasPriceChanges) {
          continue;
        }

        // zamkne food radek pro ostatni zapisy dokud neskonci transakce
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${updatePayload.foodId} FOR UPDATE`;

        let finalPriceId = item.oldData.priceId;

        // logika price
        if (item.priceData === null) {
          finalPriceId = null;
        } else if (item.priceData !== undefined) {
          const newPrice = await tx.price.create({ data: item.priceData });
          finalPriceId = newPrice.id;
        }

        // update instance
        const updatedInstance = await tx.foodInstance.update({
          where: { id: item.instanceId },
          data: {
            ...item.instanceData,
            priceId: finalPriceId,
            updateAt: new Date(),
          },
          include: { food: true },
        });

        const metadata = {};

        // metadata pro amount, unit, expirationDate pokud se zmeni
        for (const [key, newValue] of Object.entries(item.instanceData)) {
          if (newValue !== undefined) {
            metadata[key] = {
              before: item.oldData[key],
              after: newValue,
            };
          }
        }

        // metadata pro cenu pokud se zmeni
        if (finalPriceId !== item.oldData.priceId) {
          metadata.price = {
            before: item.oldData.priceId,
            after: finalPriceId,
          };
        }

        //vrati pocet instanci foodu v inventari
        const currentCount = await tx.foodInstance.count({
          where: { foodId: updatedInstance.foodId },
        });

        // zaznam historie
        const history = await tx.foodHistory.create({
          data: {
            inventoryId: updatedInstance.food.inventoryId,
            foodId: updatedInstance.foodId,
            foodInstanceId: updatedInstance.id,
            catalogId: updatedInstance.food.catalogId,
            priceId: finalPriceId,
            action: "UPDATE",
            snapshotUnit: updatedInstance?.unit,
            snapshotAmount: updatedInstance?.amount,
            quantityBefore: currentCount,
            quantityAfter: currentCount,
            changedBy: userId,
            metadata: metadata,
          },
        });
        results.push(history);
      }
      return results;
    });
  } catch (error) {
    console.error("Error updating instances:", error);
    throw error;
  }
};
