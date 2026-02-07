import {
  consumeMultipleFoodInstancesService,
  duplicateFoodInstancesService,
  updateFoodInstanceService,
} from "../services/foodInstanceService.js";
import handleResponse from "../utils/responseHandler.js";

// smaze vice foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeMultipleFoodInstances = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const food = await consumeMultipleFoodInstancesService(userId, req.body, isAdmin);
    handleResponse(res, 200, "Food consumed successfully", food);
  } catch (err) {
    next(err);
  }
};

// updatuje instanci s variantou
export const updateFoodInstance = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const food = await updateFoodInstanceService(userId, req.body, isAdmin);
    handleResponse(res, 200, "Food updated successfully", food);
  } catch (err) {
    next(err);
  }
};

// duplikuje zadane instance
export const duplicateFoodInstances = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { foodInstanceId, count } = req.body;
    const isAdmin = req.adminRoute;

    const result = await duplicateFoodInstancesService(userId, foodInstanceId, count, isAdmin);

    handleResponse(res, 201, "Instances duplicated successfully", result);
  } catch (err) {
    next(err);
  }
};
