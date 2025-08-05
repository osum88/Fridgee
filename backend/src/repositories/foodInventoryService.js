import prisma from "../utils/prisma.js";
import { getUserByIdService } from "./userRepository.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryService = async (userId, title, label) => {
    try {
        await getUserByIdService(userId);

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
export const createInventoryUserService = async (userId, foodInventoryId, role) => {
    try {
        await getUserByIdService(userId);
        await getFoodInventoryService(foodInventoryId);
        const user = await isUserInFoodInventoryService(userId, foodInventoryId);
        if (user) {
            throw new Error("UserInInventoryAlreadyExist");
        }

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
export const getFoodInventoryService = async (foodInventoryId) => {
    try {
        const existingFoodInventory = await prisma.foodInventory.findUnique({
            where: {
                id: foodInventoryId,
            },
        });
        if (!existingFoodInventory) {
            throw new Error("FoodInventoryNotFound");
        }
        return existingFoodInventory;
    } catch (error) {
        if (error.message === "FoodInventoryNotFound") {
            throw error;
        }
        console.error("Error fetching food inventory by Id:", error);
        throw error;
    }
};

// hleda user jestli je user v danem inventari podle id
export const getFoodInventoryUserService  = async (userId, foodInventoryId) => {
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
            throw new Error("UserNotFound");
        }
        return user;
    } catch (error) {
        if (error.message === "UserNotFound") {
            throw error;
        }
        console.error("Error fetching user in inventory by Id:", error);
        throw error;
    }
};

// overi jestli uz je user v danem inventari podle id
export const isUserInFoodInventoryService  = async (userId, foodInventoryId) => {
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
export const changeRoleInventoryUserService = async (userId, foodInventoryId, role) => {
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