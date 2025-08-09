import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../errors/errors.js";
import { changeRoleFoodInventoryUserRepository, createFoodInventoryRepository, createInventoryUserRepository, getFoodInventoryRepository, getFoodInventoryUserRepository, getFoodInventoryOwnerCountRepository, getFoodInventoryUserRoleRepository, isUserInFoodInventoryRepository } from "../repositories/foodInventoryRepository.js";
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
        throw new InternalServerError("Failed to create food inventory.");
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

    // kontrola, zda uživatel již v inventari neni
    const existingInventoryUser = await isUserInFoodInventoryRepository(userId, inventoryId);
    if (existingInventoryUser) {
        throw new ConflictError("User is already in this inventory.");
    }
    
    // vytvoreni noveho zaznamu
    const newInventoryUser = await createInventoryUserRepository(userId, inventoryId, role);
    if (!newInventoryUser) {
        throw new InternalServerError("Failed to add user to inventory.");
    }
    return newInventoryUser;
};

//zmeni roli usera
export const changeRoleInventoryUserService = async (ownerId, inventoryId, targetUserId, newRole, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isNaN(targetUserId)) {
        throw new BadRequestError("Invalid user ID in inventory provided.");
    }
    if (isAdmin) {
        await getUserByIdRepository(ownerId);
    } 
    await getUserByIdRepository(targetUserId);
    await getFoodInventoryRepository(inventoryId);

    //kontrola role odesilatele
    const ownerRole = await getFoodInventoryUserRoleRepository(ownerId, inventoryId);
    if (!ownerRole || ownerRole.role !== "OWNER") {
        throw new ForbiddenError("Only an OWNER can change user roles in this inventory.");
    }

    // kontrola existence cilového uzivatele v inventari
    const targetUser = await getFoodInventoryUserRoleRepository(targetUserId, inventoryId);
    if (!targetUser) {
        throw new NotFoundError("Target user is not a member of this inventory.");
    }

    // zabrani ownerovi zmenit vlastni roli na USER, pokud je jediný owner
    if (ownerId === targetUserId && newRole !== "OWNER") {
        const ownerCount = await getFoodInventoryOwnerCountRepository(inventoryId);
        if (ownerCount <= 1) {
            throw new BadRequestError("Cannot change your own role from OWNER if you are the only one.");
        }
    }

    // pokud je role stejna, nemusime nic menit
    if (targetUser.role === newRole) {
        return targetUser; 
    }
    
    // vytvoreni noveho zaznamu
    const updatedUser = await changeRoleFoodInventoryUserRepository(targetUserId, inventoryId, newRole);
    if (!updatedUser) {
        throw new InternalServerError("Failed to change user role in inventory.");
    }
    return updatedUser;
};