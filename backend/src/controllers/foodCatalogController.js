import { createFoodCatalogService, deleteFoodCatalogService, getAllFoodCatalogsByUserService, getFoodCatalogByIdService, updateFoodCatalogService } from "../services/foodCatalogService.js";
import handleResponse from "../utils/responseHandler.js";

// vytvari food catalog
export const createFoodCatalog = async (req, res, next) => {
    try {
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const foodCatalog = await createFoodCatalogService(req.body, userId, isAdmin);
        handleResponse(res, 201, "Food catalog created successfully", foodCatalog);
    } catch (err) {
        next(err);
    }
};

//vraci food catalog podle id
export const getFoodCatalogById = async (req, res, next) => {
    try {
        const { foodCatalogId } = req.params;

        const catalog = await getFoodCatalogByIdService(Number(foodCatalogId));
        handleResponse(res, 200, "Food catalog fetched successfully", catalog);
    } catch (err) {
        next(err);
    }
};

//vraci vsechny catalogy usera
export const getAllFoodCatalogsByUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const catalogs = await getAllFoodCatalogsByUserService(userId, isAdmin);
    handleResponse(res, 200, "Food catalogs fetched successfully", catalogs);
  } catch (err) {
    next(err);
  }
};

//smaze katalog podle id
export const deleteFoodCatalog = async (req, res, next) => {
    try {
        const { foodCatalogId } = req.params;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        await deleteFoodCatalogService(Number(foodCatalogId), userId, isAdmin);
        handleResponse(res, 200, "Food catalog deleted successfully");
    } catch (err) {
        next(err);
    }
};

// updatuje katalog podle id
export const updateFoodCatalog = async (req, res, next) => {
    try {
        const { foodCatalogId } = req.params;
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        const updatedCatalog = await updateFoodCatalogService(Number(foodCatalogId), userId, isAdmin, req.body);

        handleResponse(res, 200, "Food catalog updated successfully", updatedCatalog);
    } catch (err) {
        next(err);
    }
};
