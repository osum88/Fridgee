import { archiveFoodInventoryService, changeRoleInventoryUserService, changeSettingFoodInventoryUserService, createFoodInventoryService, createInventoryUserService, deleteFoodInventoryUserService, deleteOtherFoodInventoryUserService, getAllFoodInventoryService, getInventoryDetailsWithUserService, getUsersByInventoryIdService, updateFoodInventoryService } from "../services/foodInventoryService.js";
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
        handleResponse(res, 200, "Change user role successfully", newUserRole);
    }
    catch(err){
        next(err);
    }
};

//smaze sam sebe z inventare
export const deleteFoodInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const newOwnerId = req.body.newOwnerId;
        const isAdmin = req.adminRoute;
        
        const deletedUser = await deleteFoodInventoryUserService(userId, inventoryId, newOwnerId, isAdmin);
        handleResponse(res, 200, deletedUser.message, deletedUser.data);
    }
    catch(err){
        next(err);
    }
};

//admin smaze jine uzivatele z invenatre
export const deleteOtherFoodInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const targetUserId = parseInt(req.params.targetUserId, 10);
        const removerId = req.userId;
        
        const deletedUser = await deleteOtherFoodInventoryUserService(removerId, inventoryId, targetUserId);
        handleResponse(res, 200, "User deleted from inventory successfully", deletedUser);
    }
    catch(err){
        next(err);
    }
};

//vrati usera z inventare podle id
export const getUsersByInventoryId = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const rolesToFilter = req.query.role;
        const isAdmin = req.adminRoute;
        
        const inventoryUser = await getUsersByInventoryIdService(userId, inventoryId, rolesToFilter, isAdmin);
        handleResponse(res, 200, "Inventory users fetched successfully", inventoryUser);
    }
    catch(err){
        next(err);
    }
};

//archivace invenatre
export const archiveFoodInventory = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        
        const inventoryUser = await archiveFoodInventoryService(userId, inventoryId, true, isAdmin);
        handleResponse(res, 200, "Inventory archive successfully", inventoryUser);
    }
    catch(err){
        next(err);
    }
};

//zruseni archivace invenatre
export const unarchiveFoodInventory = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        
        const inventoryUser = await archiveFoodInventoryService(userId, inventoryId, false, isAdmin);
        handleResponse(res, 200, "Inventory archive successfully", inventoryUser);
    }
    catch(err){
        next(err);
    }
};

//updatuje nazev a popisek inventare
export const updateFoodInventory = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        const { title, label } = req.body;
        
        const updatedInventory = await updateFoodInventoryService(userId, inventoryId, title, label, isAdmin);
        handleResponse(res, 200, "Inventory updated successfully", updatedInventory);
    }
    catch(err){
        next(err);
    }
};

//vrati vsechny inventare uzivatele
export const getAllFoodInventory = async (req, res, next) => {
    try {
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        
        const inventories = await getAllFoodInventoryService(userId, isAdmin);
        handleResponse(res, 200, "Inventory fetched successfully", inventories);
    }
    catch(err){
        next(err);
    }
};

//vrati invetar s informacemi o uzivateli
export const getInventoryDetailsWithUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        
        const inventoryDetails = await getInventoryDetailsWithUserService(userId, inventoryId, isAdmin);
        handleResponse(res, 200, "Inventory details with user fetched successfully", inventoryDetails);
    }
    catch(err){
        next(err);
    }
};

//zmena settings
export const changeSettingFoodInventoryUser = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const userId = req.userId;
        const isAdmin = req.adminRoute;
        const settings = req.body.settings;
        
        const inventoryDetails = await changeSettingFoodInventoryUserService(userId, inventoryId, settings, isAdmin);
        handleResponse(res, 200, "User settings updated successfully", inventoryDetails);
    }
    catch(err){
        next(err);
    }
};