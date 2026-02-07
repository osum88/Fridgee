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
    const newCategory = await tx.foodCategory.create({
      data: {
        inventoryId,
        title,
      },
    });
    return newCategory;
  } catch (error) {
    console.error("Error creating food category:", error);
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
    const categories = await prisma.foodCategory.findMany({
      where: { inventoryId },
      orderBy: { createdAt: "asc" },
    });
    return categories;
  } catch (error) {
    console.error("Error fetching food categories by inventory:", error);
    throw error;
  }
};

// updatuje kategorii podle id
export const updateFoodCategoryRepository = async (id, title) => {
  try {
    const updatedCategory = await prisma.foodCategory.update({
      where: { id },
      data: { title },
    });
    return updatedCategory;
  } catch (error) {
    console.error("Error updating food category:", error);
    throw error;
  }
};

// smaze kategorii podle id
export const deleteFoodCategoryRepository = async (id) => {
  try {
    const deletedCategory = await prisma.foodCategory.delete({
      where: { id },
    });
    return deletedCategory;
  } catch (error) {
    console.error("Error deleting food category:", error);
    throw error;
  }
};

// zjisti jestli v inventari uz neexistuje katagorie s takovym nazvem
export const getFoodCategoryByTitleRepository = async (inventoryId, title, tx = prisma) => {
  try {
    const category = await tx.foodCategory.findFirst({
      where: {
        inventoryId,
        title: {
          equals: title,
          mode: "insensitive",
        },
      },
    });
    return category;
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
