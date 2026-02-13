import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { getFoodInstancesCountRepository } from "./foodRepository.js";
import {
  resolveTargetFoodEntityRepository,
  softDeleteOrphanedVariantRepository,
} from "./foodVariantRepository.js";

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
      const batchItem = existingInstances.length > 1 ? { batchItem: true } : {};

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
        const currentCount = await getFoodInstancesCountRepository(instance.foodId, tx);

        //pokud pocet instanci je 0 variant se pripravi na nejblizsi smazani
        if (currentCount === 0) {
          const food = await tx.food.findUnique({
            where: { id: instance.foodId },
            select: { variantId: true },
          });

          if (food?.variantId) {
            await tx.foodVariant.update({
              where: { id: food.variantId },
              data: { isDeleted: true },
            });
          }
        }

        // zapis do historie
        const history = await tx.foodHistory.create({
          data: {
            inventoryId: instance.food.inventoryId,
            foodId: instance.foodId,
            foodInstanceId: newAmount === 0 ? null : instance.id,
            catalogId: instance.food.catalogId,
            priceId: instance.priceId,
            action: "CONSUME",
            snapshotUnit: instance.unit,
            snapshotAmount: amountToConsume || instance.amount,
            quantityBefore: currentCount + (isFullConsumption ? 1 : 0),
            quantityAfter: currentCount,
            changedBy: userId,
            metadata:
              newAmount === 0
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

    return [...new Set(instances.map((i) => i.food.inventoryId))];
  } catch (error) {
    console.error("Error fetching inventory ids by food instance ids:", error);
    throw error;
  }
};

export const getInstancesByIdsRepository = async (ids) => {
  return await prisma.foodInstance.findMany({
    where: { id: { in: ids } },
    include: { food: true },
  });
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
export const updateFoodInstancesRepository = async (userId, updatePayload, foodId, variantData) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const results = [];

        const food = await tx.food.findUnique({
          where: { id: foodId },
          select: {
            inventoryId: true,
            catalogId: true,
            categoryId: true,
            defaultLabelId: true,
          },
        });

        let action = "UPDATE";
        let newFoodId = foodId;
        let newVariant = null;
        if (variantData) {
          console.log("1");
          newVariant = await resolveTargetFoodEntityRepository(
            {
              foodId,
              inventoryId: food.inventoryId,
              catalogId: food.catalogId,
              userId,
              variantData,
              defaultLabelId: food?.defaultLabelId,
              categoryId: food?.categoryId,
            },
            tx,
          );

          newFoodId = newVariant.foodId;
          action = newVariant.action;
        }

        for (const item of updatePayload) {
          console.log("2");

          //konotrla jestli je potreba neco menit
          const hasInstanceChanges = Object.values(item.instanceData).some(
            (val) => val !== undefined,
          );
          const hasPriceChanges = item.priceData !== undefined;
          const nothingChange = !hasInstanceChanges && !hasPriceChanges && !newVariant;

          if (nothingChange) {
            console.log("3");
            continue;
          }

          // zamkne food radek pro ostatni zapisy dokud neskonci transakce
          await tx.$executeRaw`SELECT id FROM foods WHERE id = ${newFoodId} FOR UPDATE`;

          let finalPriceId = item.oldData.priceId;

          // logika price
          if (item.priceData === null) {
            console.log("4");

            finalPriceId = null;
          } else if (item.priceData !== undefined) {
            console.log("5");

            const newPrice = await tx.price.create({ data: item.priceData });
            finalPriceId = newPrice.id;
          }

          // update instance
          const updatedInstance = await tx.foodInstance.update({
            where: { id: item.instanceId },
            data: {
              ...item.instanceData,
              foodId: newFoodId,
              priceId: finalPriceId,
              updateAt: new Date(),
            },
            include: { food: true },
          });

          const metadata = {};

          // metadata pro amount, unit, expirationDate pokud se zmeni
          for (const [key, newValue] of Object.entries(item.instanceData)) {
            if (newValue !== undefined) {
              console.log("6");

              metadata[key] = {
                before: item.oldData[key],
                after: newValue,
              };
            }
          }

          // metadata pro cenu pokud se zmeni
          if (finalPriceId !== item.oldData.priceId) {
            console.log("7");

            metadata.price = {
              before: item.oldData.priceId,
              after: finalPriceId,
            };
          }

          //metadata pokud se zmeni varianta
          if (newVariant && variantData?.old?.variantTitle !== newVariant.variantTitle) {
            console.log("8");

            metadata.variant = {
              before: variantData?.old?.variantTitle || null,
              after: newVariant.variantTitle || null,
            };
            if (action === "MERGE" && (hasInstanceChanges || hasPriceChanges)) {
              console.log("9");

              action = "UPDATE_MERGE";
            }
          }

          //vrati pocet instanci foodu v inventari
          const currentCount = await getFoodInstancesCountRepository(newFoodId, tx);

          //quantita v pripade presouvani instanci
          const quantityBefore =
            action === "MERGE" || action === "UPDATE_MERGE" ? currentCount - 1 : currentCount;

          // zaznam historie
          const history = await tx.foodHistory.create({
            data: {
              inventoryId: updatedInstance.food.inventoryId,
              foodId: newFoodId,
              foodInstanceId: updatedInstance.id,
              catalogId: updatedInstance.food.catalogId,
              priceId: finalPriceId,
              action: action,
              snapshotUnit: updatedInstance?.unit,
              snapshotAmount: updatedInstance?.amount,
              quantityBefore: quantityBefore,
              quantityAfter: currentCount,
              changedBy: userId,
              metadata: metadata,
            },
          });
          results.push(history);
        }
        if (newVariant) {
          console.log("10");

          await softDeleteOrphanedVariantRepository(variantData?.old?.variantId, tx);
        }

        return results;
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error("Error updating instances:", error);
    throw error;
  }
};

// overi zda uzivatel je jedinym, kdo ma v inventari aktivni instance daneho jidla
export const isExclusiveContributorRepository = async (foodId, userId) => {
  try {
    const otherInstance = await prisma.foodInstance.findFirst({
      where: {
        foodId: foodId,
        addedBy: { not: userId },
      },
      select: { id: true },
    });
    return otherInstance === null;
  } catch (error) {
    console.error(`Error checking exclusive contributor for foodId ${foodId}:`, error);
    throw error;
  }
};

// duplikuje zadane instance
export const duplicateFoodInstancesRepository = async (
  instances,
  catalogId,
  foodId,
  inventoryId,
  userId,
  foodInstancesIds,
  countPerSource,
) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${foodId} FOR UPDATE`;

        let rollingQuantity = await getFoodInstancesCountRepository(foodId, tx);

        const created = await tx.foodInstance.createMany({
          data: instances,
        });

        const batchItem = countPerSource > 1 ? { batchItem: true } : {};

        // vytvoreni historie
        const historyEntries = [];
        for (const sourceId of foodInstancesIds) {
          historyEntries.push({
            inventoryId: inventoryId,
            foodId: foodId,
            catalogId: catalogId,
            action: "ADD",
            changedBy: userId,
            quantityBefore: rollingQuantity,
            quantityAfter: rollingQuantity + countPerSource,
            metadata: {
              duplicatedFrom: sourceId,
              copyCount: countPerSource,
              ...batchItem,
            },
            foodInstanceId: null,
            priceId: null,
            snapshotUnit: null,
            snapshotAmount: null,
          });
          rollingQuantity += countPerSource;
        }

        await tx.foodHistory.createMany({
          data: historyEntries,
        });
        return {
          totalCreated: created.count,
          finalQuantity: rollingQuantity,
        };
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error(`Error in duplicateFoodInstancesRepository:`, error);
    throw error;
  }
};

//smaze jednu nebo vice instanci
export const deleteFoodInstancesRepository = async (instanceIds, userId) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const instancesToDelete = await tx.foodInstance.findMany({
          where: { id: { in: instanceIds } },
          include: {
            food: {},
          },
        });

        if (instancesToDelete.length === 0) return 0;

        const { foodId } = instancesToDelete[0];

        // zamkne food radek pro ostatni zapisy dokud neskonci transakce
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${foodId} FOR UPDATE`;

        let currentQuantity = await getFoodInstancesCountRepository(foodId, tx);

        const deleteResult = await tx.foodInstance.deleteMany({
          where: { id: { in: instanceIds } },
        });

        //pokud je vice instanci
        const batchItem = instancesToDelete.length > 1 ? { batchItem: true } : {};

        const historyEntries = instancesToDelete.map((instance) => {
          const entry = {
            inventoryId: instance.food.inventoryId,
            foodId: foodId,
            catalogId: instance.food.catalogId,
            priceId: instance?.priceId,
            snapshotAmount: instance?.amount,
            snapshotUnit: instance?.unit,
            quantityBefore: currentQuantity,
            quantityAfter: currentQuantity - 1,
            action: "REMOVE",
            changedBy: userId,
            metadata: batchItem,
          };
          currentQuantity -= 1;
          return entry;
        });

        if (historyEntries.length > 0) {
          await tx.foodHistory.createMany({
            data: historyEntries,
          });
        }
        return deleteResult.count;
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error("Error in deleteFoodInstancesRepository:", error);
    throw error;
  }
};
