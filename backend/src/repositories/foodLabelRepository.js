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
import { formatTitleCase, normalizeText } from "../utils/stringUtils.js";
import { cleanupUnusedImage } from "../services/foodLabelService.js";
import { deleteEveryFilesInFolderCloud } from "../services/imageService.js";

// vytvori novy food label
export const createFoodLabelRepository = async (data, tx = prisma) => {
  try {
    const createData = { ...data };
    if (data.title) {
      createData.normalizedTitle = normalizeText(data.title);
      createData.title = formatTitleCase(data.title, false);
    }

    return await tx.foodLabel.create({
      data: createData,
    });
  } catch (error) {
    console.error("Error creating food label:", error);
    throw error;
  }
};

// nacte food label podle catalog id
export const getFoodLabelByUserIdCatalogIdRepository = async (userId, catalogId) => {
  try {
    return await prisma.foodLabel.findFirst({
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
    const updateData = { ...data };

    if (data.title) {
      updateData.normalizedTitle = normalizeText(data.title);
      updateData.title = formatTitleCase(data.title, false);
    }

    return await tx.foodLabel.update({
      where: { id: labelId },
      data: updateData,
    });
  } catch (error) {
    console.error("Error updating food label:", error);
    throw error;
  }
};

// updatuje label a v pripade zmeny nazvu defaultu zaloguje historii v dotcenych inventarich
export const updateFoodLabelWithHistoryRepository = async (labelId, updateLabelData, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const updatedLabel = await updateFoodLabelRepository(
        labelId,
        { ...updateLabelData.new, isDeleted: false },
        tx,
      );

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
    console.error(`Error in updateFoodLabelWithHistoryRepository for labelId ${labelId}:`, error);
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
        label = updateFoodLabelRepository(labelId, { isDeleted: true }, tx);
        deleteLabelFlag = "SOFT-DELETE";
      } else {
        label = await tx.foodLabel.delete({
          where: { id: foodLabel.id },
        });
        await cleanupUnusedImage(foodLabel.foodImageCloudId);
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
    return await prisma.foodLabel.deleteMany({
      where: { catalogId },
    });
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
              include: { label: true },
              take: 1,
            },
          },
        },
      },
    });

    if (!userLabel) return null;

    return userLabel?.catalog?.foods?.[0]?.label ?? null;
  } catch (error) {
    console.error(`Error in getFoodLabelWithFallbackRepository for labelId ${labelId}:`, error);
    throw error;
  }
};

//hleda jidlo podle stringu
export const getLabelSuggestionsRepository = async (userId, inventoryId, searchString, limit) => {
  try {
    return await prisma.foodLabel.findMany({
      where: {
        AND: [
          {
            normalizedTitle: { contains: normalizeText(searchString), mode: "insensitive" },
          },
          {
            OR: [
              // userovi labely pouzite v invenatari
              {
                userId: userId,
                foods: { some: { inventoryId: inventoryId } },
                isDeleted: false,
              },
              // Aktivni labely v lednici (maji instance)
              {
                foods: { some: { inventoryId: inventoryId, instances: { some: {} } } },
              },
              // Neaktivni, ale maji carovy kod (bez instanci)
              {
                foods: { some: { inventoryId: inventoryId, catalog: { barcode: { not: null } } } },
              },
              // Userovi vlastni labely, ktere ale nejsou v invenatri pouzity
              { userId: userId, isDeleted: false },
            ],
          },
        ],
      },
      include: {
        catalog: true,
        foods: {
          where: { inventoryId: inventoryId, instances: { some: {} } },
          select: {
            id: true,
            variant: {
              select: {
                id: true,
                title: true,
              },
            },
            _count: {
              select: { instances: true },
            },
          },
        },
      },
      take: limit * 3,
    });
  } catch (error) {
    console.error("Error in getSmartFoodSuggestionsRepository:", error);
    throw error;
  }
};

//vyhleda useruv label podle stringu
export const getUserFoodLabelsRepository = async (userId, searchString, limit) => {
  try {
    const foodLabel = await prisma.foodLabel.findMany({
      where: {
        userId: userId,
        isDeleted: false,
        title: { contains: searchString, mode: "insensitive" },
      },
      select: {
        id: true,
        catalogId: true,
        title: true,
        description: true,
        foodImageUrl: true,
        price: true,
        unit: true,
        amount: true,
        catalog: { select: { barcode: true } },
      },
      orderBy: { title: "asc" },
      take: limit || 10,
    });
    return foodLabel.map((label) => {
      const { catalog, ...rest } = label;
      return {
        ...rest,
        barcode: catalog?.barcode || null,
      };
    });
  } catch (error) {
    console.error("Error in getUserFoodLabelsRepository:", error);
    throw error;
  }
};

// overi jestli dane id fotky se jeste nekde pouziva
export const isImageUsedElsewhereRepository = async (foodImageCloudId, tx = prisma) => {
  if (!foodImageCloudId) return false;

  try {
    return await tx.foodLabel.findFirst({
      where: {
        foodImageCloudId: foodImageCloudId,
      },
    });
  } catch (error) {
    console.error("Error checking image usage in repository:", error);
    return true;
  }
};

//vrati vsechny userovi labely a vsechny co se pouzivaji v neajkem inventari
export const getAvailableFoodLabelsRepository = async (userId, page = 0, limit = 200) => {
  try {
    return await prisma.$transaction(async (tx) => {
      // zjistime id vsech catalogu uzivatelovych labelu
      const userLabels = await tx.foodLabel.findMany({
        where: {
          userId: userId,
          isDeleted: false,
        },
        select: { catalogId: true },
      });

      const userCatalogIds = userLabels.map((l) => l.catalogId);

      const labels = await tx.foodLabel.findMany({
        where: {
          OR: [
            // vlastni labely
            { userId: userId, isDeleted: false },
            // defaultni labely k jidlu, ktere ma user v inventari
            {
              isDeleted: false,
              catalogId: { notIn: userCatalogIds },
              foods: {
                some: {
                  instances: { some: {} },
                  inventory: {
                    users: { some: { userId: userId } },
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          title: true,
          description: true,
          foodImageUrl: true,
          foodImageCloudId: true,
          price: true,
          unit: true,
          amount: true,
          userId: true,
          catalogId: true,
          catalog: { select: { barcode: true } },
        },
        orderBy: [{ title: "asc" }, { id: "asc" }],
        skip: page * limit,
        take: limit,
      });
      return labels.map(({ catalog, ...label }) => ({
        ...label,
        barcode: catalog?.barcode || null,
      }));
    });
  } catch (error) {
    console.error("Error fetching available food labels:", error);
    throw error;
  }
};


