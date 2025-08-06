import { createFoodInventoryRepository, createInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import handleResponse from "../utils/responseHandler.js";

export const createFoodInventory = async (req, res, next) => {
    try {
        const { title, label } = req.body;
        const isAdmin = req.adminRoute;
        let userId;

        if (isAdmin) {
            userId = req.body.userId;
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
        } else {
            userId = req.user.id;
        }

        const foodInventory = await createFoodInventoryRepository(userId, title, label);
        handleResponse(res, 201, "Food inventory created successfully", foodInventory);
    }
    catch(err){
        next(err);
    }
};

export const createInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const role = req.body.role;
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin) {
            userId = req.body.userId;
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
        } else {
            userId = req.user.id;
        }

        if (isNaN(inventoryId)) {
            return handleResponse(res, 400, "Invalid inventory ID provided.");
        }
        const newInventoryUser = await createInventoryUserRepository(userId, inventoryId, role);
        handleResponse(res, 201, "User added to inventory successfully", newInventoryUser);
    }
    catch(err){
        if (err.message === "FoodInventoryNotFound") {
            return handleResponse(res, 404, "Food inventory not found.");
        }
        if (err.message === "UserInInventoryAlreadyExist") {
            return handleResponse(res, 404, "User in inventory already exist.");
        }
        next(err);
    }
};

export const changeRoleInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userInventoryId = parseInt(req.params.userId, 10);

        const role = req.body.role;
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin) {
            userId = req.body.userId;
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
        } else {
            userId = req.user.id;
        }

        if (isNaN(inventoryId)) {
            return handleResponse(res, 400, "Invalid inventory ID provided.");
        }
        const newInventoryUser = await createInventoryUserRepository(userId, inventoryId, role);
        handleResponse(res, 201, "User added to inventory successfully", newInventoryUser);
    }
    catch(err){
        if (err.message === "FoodInventoryNotFound") {
            return handleResponse(res, 404, "Food inventory not found.");
        }
        if (err.message === "UserInInventoryAlreadyExist") {
            return handleResponse(res, 404, "User in inventory already exist.");
        }
        next(err);
    }
};