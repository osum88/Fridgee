import { BadRequestError, ConflictError } from "../errors/errors.js";
import { createFoodInventoryRepository, createInventoryUserRepository, getFoodInventoryRepository, isUserInFoodInventoryRepository } from "../repositories/foodInventoryRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";

// vytvari inventar s jidlem
export const createFoodInventoryService = async (userId, title, label, isAdmin) => {

    if (isAdmin) {
        await getUserByIdRepository(userId);
    }
    if (!title) {
        throw new BadRequestError("Title is required for a new food inventory.");
    }

    const newFoodInventory = await createFoodInventoryRepository(userId, title, label);

    if (!newFoodInventory) {
        throw new Error("Failed to create food inventory.");
    }
    return newFoodInventory;
};

export const createInventoryUserService = async (userId, inventoryId, role, isAdmin) => {
    
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }

    if (isAdmin) {
        await getUserByIdRepository(userId);
    } 
    
    await getUserByIdRepository(userId);
    await getFoodInventoryRepository(inventoryId);

    // kontrola, zda uživatel jižz v inventari neni
    const existingInventoryUser = await isUserInFoodInventoryRepository(userId, inventoryId);
    if (existingInventoryUser) {
        throw new ConflictError("User is already in this inventory.");
    }
    
    // vytvoreni noveho zaznamu
    const newInventoryUser = await createInventoryUserRepository(userId, inventoryId, role);
    if (!newInventoryUser) {
        throw new Error("Failed to add user to inventory.");
    }
    
    return newInventoryUser;
};