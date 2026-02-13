import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// vytvorti novou kategorii food
export const createFoodCategoryRepository = async (inventoryId, title, tx = prisma) => {
  try {
    return await tx.foodCategory.create({
      data: {
        inventoryId,
        title,
      },
    });
  } catch (error) {
    console.error("Error creating food category:", error);
    throw error;
  }
};

//vytvori categorii a zapise se to do historie
export const createFoodCategoryWithHistoryRepository = async (inventoryId, title, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const newCategory = await tx.foodCategory.create({
        data: {
          inventoryId,
          title,
        },
      });

      await tx.foodHistory.create({
        data: {
          inventoryId: newCategory.inventoryId,
          action: "CATEGORY_CREATE",
          changedBy: userId,
          metadata: {
            foodCategory: {
              after: title,
            },
          },
        },
      });
      return newCategory;
    });
  } catch (error) {
    console.error("Error creating food category with inventory history:", error);
    throw error;
  }
};

// vrati kategorii podle id
export const getFoodCategoryByIdRepository = async (id, throwError = true) => {
  try {
    const category = await prisma.foodCategory.findUnique({
      where: { id },
    });

    if (!category && throwError) {
      throw new NotFoundError("Category not found.");
    }
    return category;
  } catch (error) {
    console.error("Error fetching food category by id:", error);
    throw error;
  }
};

// vrati vsechny kategorie z konkretniho inventare
export const getFoodCategoriesByInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.foodCategory.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "asc" },
    });
  } catch (error) {
    console.error("Error fetching food categories by inventory:", error);
    throw error;
  }
};

//updatuje categorii a pokud se pouziva zapise se to do historie
export const updateFoodCategoryWithHistoryRepository = async (categoryId, title, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const oldCategory = await tx.foodCategory.findUnique({
        where: { id: categoryId },
        select: { title: true },
      });

      const updatedCategory = await tx.foodCategory.update({
        where: { id: categoryId },
        data: { title },
      });

      // najde prvni instanci, která patří do teto kategorie
      const affectedFood = await tx.food.findFirst({
        where: {
          categoryId: categoryId,
          instances: { some: {} },
        },
        select: {
          inventoryId: true,
        },
      });

      // pokud v inventari existuje alespoň jedno jidlo s instanci, zapise historii
      if (affectedFood) {
        await tx.foodHistory.create({
          data: {
            inventoryId: affectedFood.inventoryId,
            action: "CATEGORY_RENAME",
            changedBy: userId,
            metadata: {
              foodCategory: {
                before: oldCategory.title || null,
                after: title || null,
              },
            },
          },
        });
      }
      return updatedCategory;
    });
  } catch (error) {
    console.error("Error updating food category with inventory history:", error);
    throw error;
  }
};

//smaze kategorii a pokud jidlo s touto kategorii ma instance pak se zapise do historie
export const deleteFoodCategoryWithHistoryRepository = async (categoryId, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const categoryToDelete = await tx.foodCategory.findUnique({
        where: { id: categoryId },
      });

      const affectedFood = await tx.food.findFirst({
        where: {
          categoryId: categoryId,
          instances: { some: {} },
        },
        select: { inventoryId: true },
      });

      const deletedCategory = await tx.foodCategory.delete({
        where: { id: categoryId },
      });

      if (affectedFood?.inventoryId) {
        await tx.foodHistory.create({
          data: {
            inventoryId: affectedFood.inventoryId,
            action: "CATEGORY_REMOVE",
            changedBy: userId,
            metadata: {
              foodCategory: {
                before: categoryToDelete.title,
                after: null,
              },
            },
          },
        });
      }
      return deletedCategory;
    });
  } catch (error) {
    console.error("Error deleting food category with history:", error);
    throw error;
  }
};

// zjisti jestli v inventari uz neexistuje katagorie s takovym nazvem
export const getFoodCategoryByTitleRepository = async (inventoryId, title, tx = prisma) => {
  try {
    return await tx.foodCategory.findFirst({
      where: {
        inventoryId,
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });
  } catch (error) {
    console.error("Error checking food category by title:", error);
    throw error;
  }
};

//presune jidlo do jine kategorie nebo ji odebere
export const moveFoodsToCategoryRepository = async (
  inventoryId,
  foodIds,
  categoryId,
  categoryTitle,
  oldCategoryId,
  tx = prisma,
) => {
  try {
    const idsToUpdate = Array.isArray(foodIds) ? foodIds : [foodIds];
    if (idsToUpdate.length === 0) return null;

    let finalCategoryId = categoryId;

    // pokud existuje nazev hledame podle nej, pokud neexistuje odpovidajici kategorie vytvorime
    if (categoryTitle && categoryId === undefined) {
      console.log("3.1");

      let category = await getFoodCategoryByTitleRepository(inventoryId, categoryTitle, tx);

      if (!category) {
        console.log("3.2");

        category = await createFoodCategoryRepository(inventoryId, categoryTitle, tx);
      }
      finalCategoryId = category.id;
    }

    // updatujeme foods
    const updateResult = await tx.food.updateMany({
      where: {
        id: { in: idsToUpdate },
      },
      data: {
        categoryId: finalCategoryId,
      },
    });

    if (updateResult.count > 0) {
      console.log("3.3");

      // pokud uz nikdo kategorii nepouziva smazeme ji
      if (oldCategoryId && oldCategoryId !== finalCategoryId) {
        console.log("3.4");

        await tx.foodCategory.deleteMany({
          where: {
            id: oldCategoryId,
            foods: {
              none: {},
            },
          },
        });
      }
      const finalCategory = finalCategoryId
        ? await tx.foodCategory.findUnique({ where: { id: finalCategoryId } })
        : null;

      return {
        categoryId: finalCategory?.id || null,
        categoryTitle: finalCategory?.title || null,
        action: "CATEGORY_MOVE",
      };
    }
    console.log("3.5");

    return null;
  } catch (error) {
    console.error("Error updating food category:", error);
    throw error;
  }
};
