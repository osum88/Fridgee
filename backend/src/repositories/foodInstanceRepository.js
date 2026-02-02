import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeFoodInstanceRepository = async (
  userId,
  foodInstanceId,
  amountToConsume = 0,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const foodInstance = await tx.foodInstance.findUnique({
        where: { id: foodInstanceId },
        include: {
          food: {},
        },
      });

      if (!foodInstance) {
        throw new NotFoundError("Food Instance not found.");
      }

      // zamkne food radek pro ostatni zapisy dokud neskonci transakce
      await tx.$executeRaw`SELECT id FROM foods WHERE id = ${foodInstance.foodId} FOR UPDATE`;

      // aktualizace amount (castecna konzumace) nebo odstraneni instace (uplna konzumace)
      const isFullConsumption = !amountToConsume || foodInstance.amount - amountToConsume <= 0;
      const newAmount = isFullConsumption ? 0 : foodInstance.amount - amountToConsume;

      if (isFullConsumption) {
        await tx.foodInstance.delete({ where: { id: foodInstanceId } });
      } else {
        await tx.foodInstance.update({
          where: { id: foodInstanceId },
          data: { amount: newAmount },
        });
      }

      //vrati pocet instanci foodu v inventari
      const currentCountInstances = await tx.foodInstance.count({
        where: { foodId: foodInstance.foodId },
      });

      // zapis do hisotrie
      return await tx.foodHistory.create({
        data: {
          inventoryId: foodInstance.food.inventoryId,
          foodId: foodInstance.foodId,
          foodInstanceId: null,
          catalogId: foodInstance.food.catalogId,
          priceId: foodInstance?.priceId,
          action: "CONSUME",
          snapshotUnit: foodInstance?.unit,
          snapshotAmount: amountToConsume ? amountToConsume : foodInstance?.amount,
          quantityBefore: currentCountInstances + (isFullConsumption ? 1 : 0),
          quantityAfter: currentCountInstances,
          changedBy: userId,
          metadata:
            0 === newAmount
              ? { fullConsumption: isFullConsumption }
              : { amountBefore: foodInstance?.amount, amountAfter: newAmount },
        },
      });
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
export const getInventoryIdByInstanceId = async (foodInstanceId, throwError = true) => {
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
