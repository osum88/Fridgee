import { BadRequestError, NotFoundError } from "../errors/errors.js";
import { createFoodCategoryRepository, deleteFoodCategoryRepository, getFoodCategoriesByInventoryRepository, getFoodCategoryByIdRepository, getFoodCategoryByTitleRepository, updateFoodCategoryRepository } from "../repositories/foodCategoryRepository.js";
import { getFoodInventoryRepository, getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";


// vytvorti novou kategorii food
export const createFoodCategoryService = async (inventoryId, title) => {
    const titleIsExisting = await getFoodCategoryByTitleRepository(inventoryId, title);
    if (titleIsExisting) {
        throw new BadRequestError("Category title already exists in this inventory.");
    }
    await getFoodInventoryRepository(inventoryId);

    const newCategory = await createFoodCategoryRepository(inventoryId, title);
    return newCategory;
};

// vrati kategorii podle id
export const getFoodCategoryByIdService = async (id) => {
    const category = await getFoodCategoryByIdRepository(id);
    if (!category) {
        throw new NotFoundError(`Food category not found.`);
    }
    return category;
};

// vrati vsechny kategorie z konkretniho inventare
export const getFoodCategoriesByInventoryService = async (inventoryId, userId, isAdmin) => {
    if (!isAdmin) {
        await getFoodInventoryUserRepository(userId, inventoryId);
    }
    await getFoodInventoryRepository(inventoryId);
    const categories = await getFoodCategoriesByInventoryRepository(inventoryId);
    return categories;
};

// updatuje kategorii podle id
export const updateFoodCategoryService = async (userId, categoryId, title, isAdmin) => {
    const category = await getFoodCategoryByIdRepository(categoryId);
    if (!isAdmin) {
        await getFoodInventoryUserRepository(userId, category.inventoryId)
    }

    const titleIsExisting = await getFoodCategoryByTitleRepository(category.inventoryId, title);
    if (titleIsExisting && titleIsExisting.id !== categoryId) {
        throw new BadRequestError("Category title already exists in this inventory.");
    }
    await getFoodCategoryByIdRepository(categoryId);

    const updatedCategory = await updateFoodCategoryRepository(categoryId, title);
    return updatedCategory;
};

// smaze kategorii podle id
export const deleteFoodCategoryService = async (userId, categoryId, isAdmin) => {
    const category = await getFoodCategoryByIdRepository(categoryId);
    if (!isAdmin) {
        const user = await getFoodInventoryUserRepository(userId, category.inventoryId)
        if (user.role !== "OWNER" && user.role !== "EDITOR") {
            throw new BadRequestError("Only OWNER or EDITOR can delete category.");
        }   
    }

    //dodelat kontrolu jestli v kategorii neni zadne jidlo


    const deletedCategory = await deleteFoodCategoryRepository(categoryId);
    if (!deletedCategory) {
        throw new NotFoundError(`Food category not found.`);
    }
    return deletedCategory;
};








