import { changeRoleInventoryUserService, createFoodInventoryService, createInventoryUserService } from "../services/foodInventoryService.js";
import handleResponse from "../utils/responseHandler.js";

// vytvari inventar s jidlem
export const createFoodInventory = async (req, res, next) => {
    try {
        const { title, label } = req.body;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const foodInventory = await createFoodInventoryService(userId, title, label, isAdmin);
        handleResponse(res, 201, "Food inventory created successfully", foodInventory);
    }
    catch(err){
        next(err);
    }
};

//prida uzivatele do inventare
export const createInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const role = req.body.role;
        const isAdmin = req.adminRoute;
        const userId = req.userId;
     
        const newInventoryUser = await createInventoryUserService(userId, inventoryId, role, isAdmin);
        handleResponse(res, 201, "User added to inventory successfully", newInventoryUser);
    }
    catch(err){
        next(err);
    }
};

//zmeni roli uzivatele v inventari
export const changeRoleInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const targetUserId = parseInt(req.params.targetUserId, 10);
        const userId = req.userId;
        const newRole = req.body.newRole;
        const isAdmin = req.adminRoute;
        
        const newUserRole = await changeRoleInventoryUserService(userId, inventoryId, targetUserId, newRole, isAdmin);
        handleResponse(res, 201, "Change user role successfully", newUserRole);
    }
    catch(err){
        next(err);
    }
};

export const deleteFoodInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        
        const deletedUser = await changeRoleInventoryUserService(userId, inventoryId, targetUserId, role, isAdmin);
        handleResponse(res, 201, "User deleted from inventory successfully", deletedUser);
    }
    catch(err){
        next(err);
    }
};

export const deleteOtherFoodInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const targetUserId = parseInt(req.params.targetUserId, 10);
        const userId = req.userId;
        const role = req.body.role;
        const isAdmin = req.adminRoute;
        
        const deletedUser = await changeRoleInventoryUserService(userId, inventoryId, targetUserId, role, isAdmin);
        handleResponse(res, 201, "User deleted from inventory successfully", deletedUser);
    }
    catch(err){
        next(err);
    }
};
