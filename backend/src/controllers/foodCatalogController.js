import { createFoodCatalogService } from "../services/foodCatalogService.js";
import handleResponse from "../utils/responseHandler.js";


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
