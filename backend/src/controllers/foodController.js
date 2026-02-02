import { addFoodToInventoryService } from "../services/foodService.js";
import handleResponse from "../utils/responseHandler.js";

// prida jidlo do inventare a vytvori instanci, price i history
export const addFoodToInventory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const food = await addFoodToInventoryService(userId, req.body, isAdmin);
    handleResponse(res, 201, "Food created successfully", food);
  } catch (err) {
    next(err);
  }
};
