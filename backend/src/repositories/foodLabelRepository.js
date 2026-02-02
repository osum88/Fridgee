import prisma from "../utils/prisma.js";

// vytvori novy food label
export const createFoodLabelRepository = async (data) => {
    try {
        const newLabel = await prisma.foodLabel.create({
            data,
        });
        return newLabel;
    } catch (error) {
        console.error("Error creating food label:", error);
        throw error;
    }
};

// nacte food label podle id
export const getFoodLabelByUserIdCatalogIdRepository = async (userId, catalogId) => {
    try {
        const label = await prisma.foodLabel.findUnique({
            where: {
                userId_catalogId: {
                    userId,
                    catalogId,
                },
            },
            select: {
                id: true,
                title: true,
                description: true,
                foodImageUrl: true,
                price: true,
                unit: true,
                amount: true,
            }
        });
        return label;
    } catch (error) {
        console.error("Error fetching food label:", error);
        throw error;
    }
};

// updatuje food label podle id
export const updateFoodLabelRepository = async (id, data) => {
    try {
        const updatedLabel = await prisma.foodLabel.update({
            where: { id },
            data,
        });
        return updatedLabel;
    } catch (error) {
        console.error("Error updating food label:", error);
        throw error;
    }
};

// smaze food label podle id
export const deleteFoodLabelRepository = async (id) => {
    try {
        const deletedLabel = await prisma.foodLabel.delete({
            where: { id },
        });
        return deletedLabel;
    } catch (error) {
        console.error("Error deleting food label:", error);
        throw error;
    }
};

//smaze vsechny labels podle catalog id
export const deleteFoodLabelsByCatalogIdRepository = async (catalogId) => {
    try {
        const result = await prisma.foodLabel.deleteMany({
            where: { catalogId },
        });
        return result;
    } catch (error) {
        console.error("Error deleting food labels by catalogId:", error);
        throw error;
    }
};