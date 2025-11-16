import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// vytvorti novou kategorii food
export const createFoodCategoryRepository = async (inventoryId, title) => {
    try {
        const newCategory = await prisma.foodCategory.create({
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
export const getFoodCategoryByIdRepository = async (id) => {
    try {
        const category = await prisma.foodCategory.findUnique({
            where: { id },
            // include: {
            //     foods: true, 
            // },
        });
        if (!category) {
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
            // include: {
            //     foods: true,
            // },
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
export const getFoodCategoryByTitleRepository = async (inventoryId, title) => {
    try {
        const category = await prisma.foodCategory.findFirst({
            where: {
                inventoryId,
                title: {
                    equals: title,
                    mode: "insensitive"
                },
            },
        });
        return category; 
    } catch (error) {
        console.error("Error checking food category by title:", error);
        throw error;
    }
};