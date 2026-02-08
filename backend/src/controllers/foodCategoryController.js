import {
  createFoodCategoryService,
  deleteFoodCategoryService,
  getFoodCategoriesByInventoryService,
  getFoodCategoryByIdService,
  updateFoodCategoryService,
} from "../services/foodCategoryService.js";
import handleResponse from "../utils/responseHandler.js";

// vytvorti novou kategorii food
export const createFoodCategory = async (req, res, next) => {
  try {
    const { inventoryId, title } = req.body;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const newCategory = await createFoodCategoryService(
      userId,
      Number(inventoryId),
      title,
      isAdmin,
    );
    handleResponse(res, 201, "Food category created successfully", newCategory);
  } catch (err) {
    next(err);
  }
};

// vrati kategorii podle id
export const getFoodCategoryById = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await getFoodCategoryByIdService(Number(categoryId));
    handleResponse(res, 200, "Food category fetched successfully", category);
  } catch (err) {
    next(err);
  }
};

// vrati vsechny kategorie z konkretniho inventare
export const getFoodCategoriesByInventory = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const categories = await getFoodCategoriesByInventoryService(
      Number(inventoryId),
      userId,
      isAdmin,
    );
    handleResponse(res, 200, "Food categories fetched successfully", categories);
  } catch (err) {
    next(err);
  }
};

// updatuje kategorii podle id
export const updateFoodCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { title } = req.body;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const updatedCategory = await updateFoodCategoryService(
      userId,
      Number(categoryId),
      title,
      isAdmin,
    );
    handleResponse(res, 200, "Food category updated successfully", updatedCategory);
  } catch (err) {
    next(err);
  }
};

// smaze kategorii podle id
export const deleteFoodCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const deletedCategory = await deleteFoodCategoryService(userId, Number(categoryId), isAdmin);
    handleResponse(res, 200, "Food category deleted successfully", deletedCategory);
  } catch (err) {
    next(err);
  }
};
