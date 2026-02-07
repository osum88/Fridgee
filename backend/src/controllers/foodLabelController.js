import { updateFoodLabelService } from "../services/foodLabelService.js";
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
