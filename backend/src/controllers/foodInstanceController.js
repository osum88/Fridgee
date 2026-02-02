import { consumeFoodInstanceService } from "../services/foodInstanceService.js";
import { addFoodToInventoryService } from "../services/foodService.js";
import handleResponse from "../utils/responseHandler.js";

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeFoodInstance = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const food = await consumeFoodInstanceService(userId, req.body, isAdmin);
    handleResponse(res, 200, "Food consumed successfully", food);
  } catch (err) {
    next(err);
  }
};
