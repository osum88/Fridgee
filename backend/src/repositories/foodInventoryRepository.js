import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { getUserByIdRepository } from "./userRepository.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryRepository = async (userId, title, label) => {
    try {
        await getUserByIdRepository(userId);

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
export const getFoodInventoryUserRepository  = async (userId, foodInventoryId) => {
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
            throw new NotFoundError("User not found");
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
export const changeRoleInventoryUserRepository = async (userId, foodInventoryId, role) => {
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