import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import prisma from "../utils/prisma.js";

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
