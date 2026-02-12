import { deleteFoodLabelService,  getLabelSuggestionsService,  updateFoodLabelService } from "../services/foodLabelService.js";
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

//hleda jidlo podle stringu
export const getLabelSuggestions = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const { title: searchString, limit = 10 } = req.query;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    if (!searchString || searchString.trim().length < 2) {
      return handleResponse(res, 200, "Suggestions fetched successfully", []);
    }
    const suggestions = await getLabelSuggestionsService(
      userId,
      inventoryId,
      searchString,
      parseInt(limit),
      isAdmin,
    );
    handleResponse(res, 200, "Suggestions fetched successfully", suggestions);
  } catch (err) {
    next(err);
  }
};
