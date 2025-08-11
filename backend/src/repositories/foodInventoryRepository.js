import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryRepository = async (userId, title, label) => {
    try {
        const newFoodInventory = await prisma.foodInventory.create({
            data: {
                title: title,
                label: label,
                memberCount: 1,
                inventory: {
                    create: {
                        userId: userId,
                        role: "OWNER",
                    },
                },
            },
            include: {
                inventory: true,
            },
        });
        return newFoodInventory;
    } catch (error) {
        console.error("Error creating food inventory:", error);
        throw error;
    }
};

// vytvori usera food inventare
export const createInventoryUserRepository = async (userId, foodInventoryId, role) => {
    try {
        const [newInventoryUser, updatedFoodInventory] = await prisma.$transaction([
            prisma.inventoryUser.create({
                data: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                    role: role,
                },
            }),
            prisma.foodInventory.update({
                where: {
                    id: foodInventoryId,
                },
                data: {
                    memberCount: {
                        increment: 1,
                    },
                },
            }),
        ]);
        return { newInventoryUser, updatedFoodInventory };
    } catch (error) {
        console.error("Error creating new inventory user:", error);
        throw error;
    }
};

// ziskani inventare podle id
export const getFoodInventoryRepository = async (foodInventoryId) => {
    try {
        const existingFoodInventory = await prisma.foodInventory.findUnique({
            where: {
                id: foodInventoryId,
            },
        });
        if (!existingFoodInventory) {
            throw new NotFoundError("Food inventory not found");
        }
        return existingFoodInventory;
    } catch (error) {
        console.error("Error fetching food inventory by Id:", error);
        throw error;
    }
};

// hleda user jestli je user v danem inventari podle id
export const getFoodInventoryUserRepository = async (userId, foodInventoryId) => {
    try {
        const user = await prisma.inventoryUser.findUnique({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
        });
        if (!user) {
            throw new NotFoundError("User not found in inventory");
        }
        return user;
    } catch (error) {
        console.error("Error fetching user in inventory by Id:", error);
        throw error;
    }
};

// overi jestli uz je user v danem inventari podle id
export const isUserInFoodInventoryRepository  = async (userId, foodInventoryId) => {
    try {
        const user = await prisma.inventoryUser.findUnique({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
        });
        return !!user;
    } catch (error) {
        console.error("Error fetching user in inventory by Id:", error);
        throw error;
    }
};

// zmena role user v inventari
export const changeRoleFoodInventoryUserRepository = async (userId, foodInventoryId, role) => {
    try {
        const updatedUser = await prisma.inventoryUser.update({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
            data: {
                role: role,
            },
        });
        return updatedUser;
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};

//vrati roli uzivatele v inventari
export const getFoodInventoryUserRoleRepository = async (userId, foodInventoryId) => {
    try {
        const role = await prisma.inventoryUser.findUnique({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
            select: {
                role: true,
            }
        });
        if (!role) {
            throw new NotFoundError("User role in inventory not found");
        }
        return role;
    } catch (error) {
        console.error("Error fetching role in inventory by Id:", error);
        throw error;
    }
};

//vrati pocet owneru
export const getFoodInventoryOwnerCountRepository = async (inventoryId) => {
    try {
        const ownerCount = await prisma.inventoryUser.count({
            where: {
                inventoryId: inventoryId,
                role: "OWNER",
            },
        });
        return ownerCount;
    } catch (error) {
        console.error("Error fetching inventory owner count:", error);
        throw error;
    }
};

//smaze uzivatele inventare
export const deleteUserFoodInventoryRepository = async (userId, inventoryId) => {
    try {
        const [deletedUser, updatedFoodInventory] = await prisma.$transaction([
            prisma.inventoryUser.delete({
                where: {
                    userId_inventoryId: {
                        userId: userId,
                        inventoryId: inventoryId,
                    },
                },
            }),
            prisma.foodInventory.update({
                where: {
                    id: inventoryId,
                },
                data: {
                    memberCount: {
                        decrement: 1,
                    },
                },
            }),
        ]);
        return { deletedUser, updatedFoodInventory };
    } catch (error) {
        console.error("Error deleting user in inventory:", error);
        throw error;
    }
};

//smaze inventar
export const deleteFoodInventoryRepository = async (inventoryId) => {
    try {
        const deletedInventory = await prisma.foodInventory.delete({
            where: {
                id: inventoryId, 
            },
        });
        return deletedInventory;
    } catch (error) {
        console.error("Error deleting food inventory:", error);
        throw error;
    }
};

//vrati user podle role
export const getUsersByInventoryIdRepository = async (inventoryId, rolesToFilter) => {
    try {
        const userInventory = await prisma.inventoryUser.findMany({
            where: {
                inventoryId: inventoryId,
                ...(rolesToFilter && {
                    role: {
                        in: Array.isArray(rolesToFilter) ? rolesToFilter : [rolesToFilter],
                    },
                }),
                
            },
            orderBy: [
                { user: { name: "asc" } },
                { user: { surname: "asc" } },
                { user: { username: "asc" } },
            ],
            select: {
                id: true,
                userId: true,
                inventoryId: true,
                role: true,
                notificationSettings: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        surname: true,
                        username: true,
                        birthDate: true,
                        email: true,
                        profilePictureUrl: true,
                        preferredLanguage: true,
                    }, 
                },
            },
        });
        return userInventory;
    } catch (error) {
        console.error("Error fetching users by inventory ID:", error);
        throw error;
    }
};

//archivace inventare
export const archiveFoodInventoryRepository = async (inventoryId) => {
    try {
        const archivedInventory = await prisma.foodInventory.update({
            where: {
                id: inventoryId, 
            },
            data: {
                isArchived: true,
            }
        });
        return archivedInventory;
    } catch (error) {
        console.error("Error archiving inventory:", error);
        throw error;
    }
};

//zruseni archivace inventare
export const unarchiveFoodInventoryRepository = async (inventoryId) => {
    try {
        const unarchivedInventory = await prisma.foodInventory.update({
            where: {
                id: inventoryId, 
            },
            data: {
                isArchived: false,
            }
        });
        return unarchivedInventory;
    } catch (error) {
        console.error("Error unarchiving inventory:", error);
        throw error;
    }
};

//update title a label inventare
export const updateFoodInventoryRepository = async (inventoryId, title, label) => {
    try {
        const updatedInventory = await prisma.foodInventory.update({
            where: {
                id: inventoryId, 
            },
            data: {
                title: title,
                label: label,
                lastActivityAt: new Date(),
            }
        });
        return updatedInventory;
    } catch (error) {
        console.error("Error updating inventory:", error);
        throw error;
    }
};

//update last activity at inventare
export const updateLastActivityAtFoodInventoryRepository = async (inventoryId) => {
    try {
        const updatedInventory = await prisma.foodInventory.update({
            where: {
                id: inventoryId, 
            },
            data: {
                lastActivityAt: new Date(),
            }
        });
        return updatedInventory;
    } catch (error) {
        console.error("Error updating last activity at inventory:", error);
        throw error;
    }
};

//vrati vsechny inventare pod id usera
export const getAllFoodInventoryRepository = async (userId) => {
    try {
        const inventoryUserRecords = await prisma.inventoryUser.findMany({
            where: {
                userId: userId,
            },
            select: {
                inventoryId: true,
            },
        });

        // ziska pole ID inventaru z vysledku prvniho dotazu
        const inventoryIds = inventoryUserRecords.map(record => record.inventoryId);

        if (inventoryIds.length === 0) {
            return [];
        }
        const foodInventories = await prisma.foodInventory.findMany({
            where: {
                id: {
                    in: inventoryIds,
                },
                isArchived: false,
            },
            select: {
                id: true, 
                title: true,
                label: true,
                memberCount: true,
                lastActivityAt: true,
            },
            orderBy: {
                lastActivityAt: "desc", 
            },
        });
        return foodInventories;
    } catch (error) {
        console.error("Error fetching food inventory:", error);
        throw error;
    }
};

// zmena settingu user v inventari
export const changeSettingFoodInventoryUserRepository = async (userId, foodInventoryId, newSettings) => {
    try {
        const existingSettings = await prisma.inventoryUser.findUnique({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
            select: {
                notificationSettings: true,
            },
        });

        // spojeni aktualniho nastaveni s novym
        const updatedSettings = {
            ...existingSettings.notificationSettings,
            ...newSettings,
        };

        const updatedUser = await prisma.inventoryUser.update({
            where: {
                userId_inventoryId: {
                    userId: userId,
                    inventoryId: foodInventoryId,
                },
            },
            data: {
                notificationSettings: updatedSettings,
            },
            select: {
                notificationSettings: true,
                id: true,
                userId: true,
                inventoryId: true,
            },
        });
        return updatedUser;
    } catch (error) {
        console.error("Error updating user setting:", error);
        throw error;
    }
};