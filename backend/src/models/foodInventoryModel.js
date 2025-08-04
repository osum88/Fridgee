import prisma from "../utils/prisma.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryService = async (userId, title, label) => {
    try {
        const foodInventory = await prisma.foodInventory.create({
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
        return foodInventory;
    } catch (error) {
        console.error("Error creating food inventory:", error);
        throw error;
    }
};