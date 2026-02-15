import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { normalizeText } from "../utils/stringUtils.js";

//zapise zmenu labelu do historie, pro dany invenatr vznikne maximalne jeden zaznam
export const logLabelUpdateHistoryRepository = async (
  labelId,
  oldTitle,
  newTitle,
  userId,
  tx = prisma,
) => {
  try {
    if (newTitle === undefined || oldTitle === newTitle) {
      return null;
    }
    //najde vsechny jidla s defaultnim nazvem
    const affectedFoods = await tx.food.findMany({
      where: { defaultLabelId: labelId },
      include: {
        _count: {
          select: { instances: true },
        },
      },
    });

    // chceme jen jeden zaznam na jeden inventar
    const uniqueInventoryHistory = new Map();
    for (const food of affectedFoods) {
      // zapiseme pouze pokud má food alespon jednu instanci
      if (food._count.instances > 0 && !uniqueInventoryHistory.has(food.inventoryId)) {
        uniqueInventoryHistory.set(food.inventoryId, {
          inventoryId: food.inventoryId,
          foodId: food.id,
          catalogId: food.catalogId,
          action: "LABEL_UPDATE",
          changedBy: userId,
          quantityBefore: null,
          quantityAfter: null,
          metadata: {
            before: oldTitle || null,
            after: newTitle || null,
          },
          foodInstanceId: null,
          priceId: null,
          snapshotUnit: null,
          snapshotAmount: null,
        });
      }
    }

    const finalHistories = Array.from(uniqueInventoryHistory.values());

    if (finalHistories.length > 0) {
      await tx.foodHistory.createMany({
        data: finalHistories,
      });
    }
  } catch (error) {
    console.error(`Error logging label history for labelId ${labelId}:`, error);
    throw error;
  }
};

// vraci historii
export const getHistoryRepository = async (inventoryId, userId, data) => {
  const { limit, cursorId, type, fromDate, toDate, searchString, changedBy } = data;

  return await prisma.foodHistory.findMany({
    where: {
      inventoryId,
      ...(changedBy?.length && { changedBy: { in: changedBy } }),
      ...(type?.length && { action: { in: type } }),
      ...((fromDate || toDate) && {
        changedAt: {
          ...(fromDate && { gte: new Date(fromDate) }),
          ...(toDate && { lte: new Date(toDate) }),
        },
      }),
      ...(searchString && {
        OR: [
          {
            catalog: {
              labels: {
                some: {
                  userId,
                  normalizedTitle: { contains: normalizeText(searchString), mode: "insensitive" },
                },
              },
            },
          },
          {
            catalog: {
              labels: {
                none: { userId },
              },
              foods: {
                some: {
                  label: {
                    normalizedTitle: { contains: normalizeText(searchString), mode: "insensitive" },
                  },
                },
              },
            },
          },
        ],
      }),
    },

    take: limit,
    skip: cursorId ? 1 : 0,
    cursor: cursorId ? { id: cursorId } : undefined,
    orderBy: [{ changedAt: "desc" }, { id: "desc" }],

    select: {
      id: true,
      foodId: true,
      catalogId: true,
      action: true,
      snapshotUnit: true,
      snapshotAmount: true,
      quantityBefore: true,
      quantityAfter: true,
      changedBy: true,
      changedAt: true,
      metadata: true,
      user: {
        select: {
          name: true,
          surname: true,
          username: true,
        },
      },
      instance: {
        select: {
          unit: true,
          amount: true,
          expirationDate: true,
        },
      },
      price: {
        select: {
          price: true,
          baseCurrency: true,
          exchangeAmount: true,
          exchangeRate: true,
        },
      },
      catalog: {
        select: {
          barcode: true,
          labels: {
            where: { userId },
            select: {
              title: true,
            },
          },
        },
      },
      food: {
        select: {
          label: {
            select: {
              title: true,
            },
          },
          variant: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
};
