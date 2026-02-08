import prisma from "../utils/prisma.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { logLabelUpdateHistoryRepository } from "./foodHistoryRepository.js";
import { deleteFoodCatalogRepository } from "./foodCatalogRepository.js";

// vytvori novy food label
export const createFoodLabelRepository = async (data, tx = prisma) => {
  try {
    const newLabel = await tx.foodLabel.create({
      data,
    });
    return newLabel;
  } catch (error) {
    console.error("Error creating food label:", error);
    throw error;
  }
};

// nacte food label podle catalog id
export const getFoodLabelByUserIdCatalogIdRepository = async (userId, catalogId) => {
  try {
    const label = await prisma.foodLabel.findFirst({
      where: {
        userId,
        catalogId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        foodImageUrl: true,
        price: true,
        unit: true,
        amount: true,
      },
    });
    return label;
  } catch (error) {
    console.error("Error fetching food label:", error);
    throw error;
  }
};

// nacte food label podle id
export const getFoodLabelByIdRepository = async (labelId, throwError = true, tx = prisma) => {
  try {
    const label = await tx.foodLabel.findUnique({
      where: {
        id: labelId,
      },
    });
    if (!label && throwError) {
      throw new NotFoundError("Food label not found.");
    }
    return label;
  } catch (error) {
    console.error("Error fetching food label:", error);
    throw error;
  }
};

// updatuje food label podle id
export const updateFoodLabelRepository = async (labelId, data, tx = prisma) => {
  try {
    const updatedLabel = await tx.foodLabel.update({
      where: { id: labelId },
      data,
    });
    return updatedLabel;
  } catch (error) {
    console.error("Error updating food label:", error);
    throw error;
  }
};

// updatuje label a v pripade zmeny nazvu defaultu zaloguje historii v dotcenych inventarich
export const updateFoodLabelWithHistoryRepository = async (labelId, updateLabelData, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const updatedLabel = await tx.foodLabel.update({
        where: { id: labelId },
        data: { ...updateLabelData.new, isDeleted: false },
      });
      await logLabelUpdateHistoryRepository(
        labelId,
        updateLabelData?.old?.title,
        updatedLabel?.title,
        userId,
        tx,
      );
      return updatedLabel;
    });
  } catch (error) {
    console.error(`Error in updateFoodLabelRepository for labelId ${labelId}:`, error);
    throw error;
  }
};

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
export const deleteFoodLabelRepository = async (labelId, userId, isAdmin) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const foodLabel = await tx.foodLabel.findUnique({
        where: { id: labelId },
      });

      if (!foodLabel) return null;

      const affectedFoods = await tx.food.findFirst({
        where: { defaultLabelId: labelId },
      });

      //pokud se label pouziva pouzije se soft delete
      let label = undefined;
      let deleteLabelFlag = undefined;
      if (affectedFoods) {
        label = await tx.foodLabel.update({
          where: { id: labelId },
          data: { isDeleted: true },
        });
        deleteLabelFlag = "SOFT-DELETE";
      } else {
        label = await tx.foodLabel.delete({
          where: { id: foodLabel.id },
        });
        deleteLabelFlag = "HARD-DELETE";
      }
      const catalog = await deleteFoodCatalogRepository(foodLabel.catalogId, userId, isAdmin, tx);
      return { foodLabel: { ...label, deleteLabelFlag }, foodCatalog: catalog };
    });
  } catch (error) {
    console.error("Error deleting food label:", error);
    throw error;
  }
};

//smaze vsechny labels podle catalog id
export const deleteFoodLabelsByCatalogIdRepository = async (catalogId) => {
  try {
    const result = await prisma.foodLabel.deleteMany({
      where: { catalogId },
    });
    return result;
  } catch (error) {
    console.error("Error deleting food labels by catalogId:", error);
    throw error;
  }
};

// ziska defaultni label z food pokud user nema label
export const getDefaultFoodLabelByUserLabelIdRepository = async (labelId, userId, tx = prisma) => {
  try {
    const userLabel = await tx.foodLabel.findUnique({
      where: { id: labelId },
      include: {
        catalog: {
          include: {
            foods: {
              where: {
                inventory: {
                  users: {
                    some: { userId: userId },
                  },
                },
              },
              include: {
                label: true,
              },
              take: 1,
            },
          },
        },
      },
    });

    if (!userLabel) return null;

    const inventoryDefaultLabel = userLabel?.catalog?.foods?.[0]?.label ?? null;

    return inventoryDefaultLabel;
  } catch (error) {
    console.error(`Error in getFoodLabelWithFallbackRepository for labelId ${labelId}:`, error);
    throw error;
  }
};
