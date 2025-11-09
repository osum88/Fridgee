import prisma from "../utils/prisma.js";

//vytvori novy food catalog
export const createFoodCatalogRepository = async (userId, barcode, title, description, price, unit, amount, isGlobal, foodImageUrl) => {
    try {
        const newFoodCatalog = await prisma.foodCatalog.create({
            data: {
                barcode,
                title,
                description,
                price,
                unit,
                amount,
                addedBy: userId,
                isGlobal,
                foodImageUrl,
            },
        });
        return newFoodCatalog;
    } catch (error) {
        console.error("Error creating food catalog:", error);
        throw error;
    }
};

//aktualizuje existujici food catalog podle id
export const updateFoodCatalogRepository = async (id, updates) => {
    try {
        const updatedFoodCatalog = await prisma.foodCatalog.update({
            where: { id },
            data: updates,
        });
        return updatedFoodCatalog;
    } catch (error) {
        console.error("Error updating food catalog:", error);
        throw error;
    }
};

//smaze food catalog podle id
export const deleteFoodCatalogRepository = async (id) => {
    try {
        const deletedFoodCatalog = await prisma.foodCatalog.delete({
            where: { id },
        });
        return deletedFoodCatalog;
    } catch (error) {
        console.error("Error deleting food catalog:", error);
        throw error;
    }
};

//vrati food catalog podle id
export const getFoodCatalogByIdRepository = async (id) => {
    try {
        const foodCatalog = await prisma.foodCatalog.findUnique({
            where: { id },
        });
        return foodCatalog;
    } catch (error) {
        console.error("Error fetching food catalog by id:", error);
        throw error;
    }
};

//vrati food catalog podle barcode a uzivatele
export const getFoodCatalogByBarcodeRepository = async (barcode, addedBy) => {
    try {
        const foodCatalog = await prisma.foodCatalog.findUnique({
            where: {
                barcode_addedBy: {
                    barcode,
                    addedBy,
                },
            },
        });
        return foodCatalog;
    } catch (error) {
        console.error("Error fetching food catalog by barcode and user:", error);
        throw error;
    }
};

//vrati vsechny food katalogy pridane uzivatelem
export const getAllFoodCatalogsByUserRepository = async (userId) => {
    try {
        return await prisma.foodCatalog.findMany({
            where: { addedBy: userId },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Error fetching user food catalogs:", error);
        throw error;
    }
};

//vyhleda food katalogy podle title a uzivatele, a path(jazyk)
export const searchFoodCatalogsRepository = async (userId, title, path="unk") => {
    try {
        return await prisma.foodCatalog.findMany({
            where: {
                addedBy: userId,
                title: {
                    path: [path],
                    string_contains: title,
                    string_mode: "insensitive",
                },
            },
        });
    } catch (error) {
        console.error("Error searching food catalogs:", error);
        throw error;
    }
};

//overi ze uzivatel je vlastnikem food katalogu
export const validateCatalogOwnershipRepository = async (id, userId) => {
    try {
        const catalog = await prisma.foodCatalog.findUnique({
            where: { id },
            select: { addedBy: true },
        });
        return catalog?.addedBy === userId;
    } catch (error) {
        console.error("Error validating catalog ownership:", error);
        throw error;
    }
};



// getFoodCatalogWithVariantsRepository