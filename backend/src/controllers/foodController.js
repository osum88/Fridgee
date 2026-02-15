import { addFoodToInventoryService, updateFoodService } from "../services/foodService.js";
import handleResponse from "../utils/responseHandler.js";

// prida jidlo do inventare a vytvori instanci, price i history
export const addFoodToInventory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;
    const image = req.file && req.file.size > 0 ? req.file : undefined;

    const food = await addFoodToInventoryService(userId, {...req.body, image}, isAdmin);
    handleResponse(res, 201, "Food created successfully", food);
  } catch (err) {
    next(err);
  }
};

// updatuje food, categorii a label food
export const updateFood = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;
    const image = req.file && req.file.size > 0 ? req.file : undefined;

    const food = await updateFoodService(userId, { ...req.body, image }, isAdmin);
    handleResponse(res, 200, "Food updated successfully", food);
  } catch (err) {
    next(err);
  }
};
