import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../errors/errors.js";
import { changeRoleFoodInventoryUserRepository, createFoodInventoryRepository, createInventoryUserRepository, getFoodInventoryRepository, getFoodInventoryUserRepository, getFoodInventoryOwnerCountRepository, getFoodInventoryUserRoleRepository, isUserInFoodInventoryRepository, deleteUserFoodInventoryRepository, deleteFoodInventoryRepository, getUsersByInventoryIdRepository, archiveFoodInventoryRepository, unarchiveFoodInventoryRepository, updateFoodInventoryRepository, getAllFoodInventoryRepository, changeSettingFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
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

//smaze uzivatele inventare
export const deleteFoodInventoryUserService = async (userId, inventoryId, newOwnerId = null, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isAdmin){
        getUserByIdRepository(userId);
    }
    
    await getFoodInventoryRepository(inventoryId);

    // kontrola existence uzivatele v inventari
    const userInventory = await getFoodInventoryUserRepository(userId, inventoryId);
    if (!userInventory) {
        throw new NotFoundError("User is not a member of this inventory.");
    }

    //pokud neni owner tak se jen smaze
    if (userInventory.role !== "OWNER"){
        const deletedUser = await deleteUserFoodInventoryRepository(userId, inventoryId);
        return { message: "User removed successfully.", data: deletedUser };
    }

    //pokud je vic owneru, tak se jen smaze
    const ownerCount = await getFoodInventoryOwnerCountRepository(inventoryId);
    if (ownerCount > 1) {
        const deletedUser = await deleteUserFoodInventoryRepository(userId, inventoryId);
        return { message: "Owner removed successfully.", data: deletedUser };
    }

    //pokud je ownerem a je poslednim v invenatri, pak se smaze cely inventar
    const inventory = await getFoodInventoryRepository(inventoryId);
    if (inventory.memberCount > 1) {
        // Musí předat vlastnictví, než odejde.
        if (!newOwnerId) {
            throw new BadRequestError("Cannot remove the last owner without transferring ownership.");
        }
        if (isNaN(newOwnerId)) {
            throw new BadRequestError("Invalid new owner ID provided.");
        }
        if (userId === newOwnerId) {
            throw new BadRequestError("Cannot transfer ownership to yourself.");
        }

        //overeni noveho ownera pro predani vlastnictvi
        const newOwner = await getFoodInventoryUserRepository(newOwnerId, inventoryId);
        if (!newOwner) {
            throw new NotFoundError("New owner not found in this inventory.");
        }
        await changeRoleFoodInventoryUserRepository(newOwnerId, inventoryId, "OWNER");
        const deletedUser = await deleteUserFoodInventoryRepository(userId, inventoryId);
        return { message: "Ownership transferred and previous owner removed successfully.", data: deletedUser };
    } else {
        //pokud je owner posledni v inventari tak se smaze s nim
        const deletedUser = await deleteUserFoodInventoryRepository(userId, inventoryId);
        await deleteFoodInventoryRepository(inventoryId);
        return { message: "Last owner left, inventory and all its data have been deleted.", data: deletedUser};
    }
};

//owner smaze jineho uzivatele z inventare
export const deleteOtherFoodInventoryUserService = async (removerId, inventoryId, targetUserId) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isNaN(targetUserId)) {
        throw new BadRequestError("Invalid target user ID provided.");
    }

    // kontrola ze neodstranuje sam sebe
    if (removerId === targetUserId) {
        throw new BadRequestError("You cannot remove yourself. Please use the self-removal function.");
    }
    await getUserByIdRepository(targetUserId);
    await getFoodInventoryRepository(inventoryId);

    // kontrola existence odstranujiciho uzivatele v inventari
    const removerInventoryUser = await getFoodInventoryUserRepository(removerId, inventoryId);
    if (!removerInventoryUser) {
        throw new ForbiddenError("You do not have permission to perform this action.");
    }

    // kontrola existence cilového uzivatele v inventari
    const targetInventoryUser = await getFoodInventoryUserRepository(targetUserId, inventoryId);
    if (!targetInventoryUser) {
        throw new NotFoundError("Target user is not a member of this inventory.");
    }
    
    // pouze owner muze smazat jineho uzivatele
    if (removerInventoryUser.role !== "OWNER") {
        throw new ForbiddenError("Only the owner of the inventory can remove other users.");
    }

    // smazani ciloveho uzivatele z inventare
    const deletedUser = await deleteUserFoodInventoryRepository(targetUserId, inventoryId);
    if (!deletedUser) {
        throw new InternalServerError("Failed to remove user from inventory.");
    }
    return deletedUser;
};

//vrati uzivatele podle id a role
export const getUsersByInventoryIdService = async (userId, inventoryId, rolesToFilter, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    await getFoodInventoryRepository(inventoryId);

    // kontrola existence uzivatele v inventari
    if (!isAdmin) {
        const removerInventoryUser = await getFoodInventoryUserRepository(userId, inventoryId);
        if (!removerInventoryUser) {
            throw new ForbiddenError("You do not have permission to view users in this inventory.")
        }
    }

    // vrati uzivatele z inventare
    const inventoryUsers = await getUsersByInventoryIdRepository(inventoryId, rolesToFilter);
    return inventoryUsers;
};

//archivace inventare
export const archiveFoodInventoryService = async (userId, inventoryId, isArchived, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isAdmin) {
        await getUserByIdRepository(userId);
    }
    const inventory = await getFoodInventoryRepository(inventoryId);
    if (inventory.isArchived === isArchived) {
        return inventory;
    }

    // kontrola existence cilového uzivatele v inventari
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId);
    if (!inventoryUser) {
        throw new NotFoundError("User is not a member of this inventory.");
    }
    
    // pouze owner muze archivocat inventar
    if (inventoryUser.role !== "OWNER") {
        throw new ForbiddenError("Only the owner of the inventory can un/archive inventary.");
    }

    // archivace inventare
    let updatedInventory;
    if (isArchived) {
        updatedInventory = await archiveFoodInventoryRepository(inventoryId);
    } else {
        updatedInventory = await unarchiveFoodInventoryRepository(inventoryId);
    }
    
    if (!updatedInventory) {
        throw new InternalServerError("Failed to un/archive the inventory.");
    }
    return updatedInventory;
};

//updatuje nazev a label inventare
export const updateFoodInventoryService = async (userId, inventoryId, title, label, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    await getFoodInventoryRepository(inventoryId);

    // kontrola existence uzivatele v inventari
    if (!isAdmin) {
        const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId);
        if (!inventoryUser) {
            throw new ForbiddenError("Only the owner of the inventory can update it.");
        }

        // pouze owner muze updatovat inventar
        if (inventoryUser.role !== "OWNER") {
            throw new ForbiddenError("Only the owner of the inventory can update inventory.");
        }
    }

    // updatuje title a label inventare
    const updatedInventory = await updateFoodInventoryRepository(inventoryId, title, label);
    return updatedInventory;
};

//vrati uzivatele inventare
export const getAllFoodInventoryService = async (userId, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId);
    }

    // vrati inventare
    const inventories = await getAllFoodInventoryRepository(userId);
    return inventories;
};

//vrati invetar s informacemi o uzivateli
export const getInventoryDetailsWithUserService = async (userId, inventoryId, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isAdmin) {
        await getUserByIdRepository(userId);
    }
    const inventory = await getFoodInventoryRepository(inventoryId);

    // kontrola existence uzivatele v inventari
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId);
    if (!inventoryUser) {
        throw new ForbiddenError("Only the member of the inventory can view it.");
    }

    // spojeni dat do jednoho objektu
    const combinedData = {
        inventory: inventory,
        userRole: inventoryUser.role,
        userSetting: inventoryUser.notificationSettings,
    };
    return combinedData;
};

//zmena settingu pro uzivatele
export const changeSettingFoodInventoryUserService = async (userId, inventoryId, settings, isAdmin) => {
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isAdmin) {
        await getUserByIdRepository(userId);
    }

    // kontrola existence cilového uzivatele v inventari
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId);
    if (!inventoryUser) {
        throw new NotFoundError("You do not have permission to modify settings in this inventory.");
    }
    
    // zmena settingu usera
    const updatedUser = await changeSettingFoodInventoryUserRepository(userId, inventoryId, settings);
    return updatedUser;
};
