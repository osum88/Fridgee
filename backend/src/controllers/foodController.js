import { addFoodInstanceService } from "../services/foodInstanceService.js";
import {
  addFoodToInventoryService,
  getFoodByBarcodeService,
  getFoodDetailService,
  updateFoodService,
} from "../services/foodService.js";
import handleResponse from "../utils/responseHandler.js";

// prida jidlo do inventare a vytvori instanci, price i history
export const addFoodToInventory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;
    const image = req.file && req.file.size > 0 ? req.file : undefined;

    const food = await addFoodToInventoryService(userId, { ...req.body, image }, isAdmin);
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

// vrati vsechny instance food podle barcodu
export const getFoodByBarcode = async (req, res, next) => {
  try {
    const { inventoryId, barcode } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const foodData = await getFoodByBarcodeService(barcode, inventoryId, userId, isAdmin);
    handleResponse(res, 200, "Food by barcode fetched successfully", foodData);
  } catch (err) {
    next(err);
  }
};

//vrati detail jidla
export const getFoodDetail = async (req, res, next) => {
  try {
    const { inventoryId, foodId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const food = await getFoodDetailService(inventoryId, foodId, userId, isAdmin);
    handleResponse(res, 200, "Food detail fetched successfully", food);
  } catch (err) {
    next(err);
  }
};

// prida instanci
export const addFoodInstance = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const instances = await addFoodInstanceService(userId, req.body, isAdmin);
    handleResponse(res, 201, "Food instance created successfully", instances);
  } catch (err) {
    next(err);
  }
};