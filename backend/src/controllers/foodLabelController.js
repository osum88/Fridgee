import { deleteFoodLabelService, updateFoodLabelService } from "../services/foodLabelService.js";
import handleResponse from "../utils/responseHandler.js";

// updatuje uzivateluv label
export const updateFoodLabel = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const label = await updateFoodLabelService(userId, req.body, isAdmin);
    handleResponse(res, 200, "Label updated successfully", label);
  } catch (err) {
    next(err);
  }
};

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
export const deleteFoodLabel = async (req, res, next) => {
  try {
    const { foodLabelId } = req.params;
    const userId = req.userId; 
    const isAdmin = req.adminRoute;

    const result = await deleteFoodLabelService(foodLabelId, userId, isAdmin);
    handleResponse(res, 200, "Label deleted successfully", result);
  } catch (error) {
    next(error);
  }
};

