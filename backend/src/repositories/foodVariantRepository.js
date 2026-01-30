import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// vytvori novou variantu
export const createFoodVariantRepository = async (data) => {
    try {
        const newVariant = await prisma.foodVariant.create({
            data,
        });
        return newVariant;
    } catch (error) {
        console.error("Error creating food variant:", error);
        throw error;
    }
};

// vrati variantu podle id
export const getFoodVariantByIdRepository = async (id, throwError = true,) => {
    try {
        const variant = await prisma.foodVariant.findUnique({
            where: { id },
        });
        if (!variant && throwError) {
            throw new NotFoundError("Food variant not found.");
        }
        return variant;
    } catch (error) {
        console.error("Error fetching food variant:", error);
        throw error;
    }
};

// nacte vsechny varianty z catalogu
export const getAllFoodVariantsRepository = async (catalogId) => {
    try {
        const variants = await prisma.foodVariant.findMany({
            where: { foodCatalogId: catalogId },
            orderBy: { title: "asc" },
        });
        return variants;
    } catch (error) {
        console.error("Error fetching all food variants:", error);
        throw error;
    }
};

//@TODO vratit i varianty co se pouzivaji v inventari (isDeleted pro user, invetnater muzu byt true)
// nacte vsechny uzivatelovy varianty z catalogu nebo ty co se pouzivaji v inventari
export const getRelevantFoodVariantsRepository = async (catalogId, userId) => {
    try {
        const variants = await prisma.foodVariant.findMany({
            where: { 
                foodCatalogId: catalogId,
                addedBy: userId
            },
            orderBy: { title: "asc" },
            select: {
                id: true,
                title: true,    
        }});
        return variants;
    } catch (error) {
        console.error("Error fetching all relevantfood variants:", error);
        throw error;
    }
};

// aktualizuje variantu podle id
export const updateFoodVariantRepository = async (id, data) => {
    try {
        const updatedVariant = await prisma.foodVariant.update({
            where: { id },
            data,
        });
        return updatedVariant;
    } catch (error) {
        console.error("Error updating food variant:", error);
        throw error;
    }
};

// smaze variantu podle id
export const deleteFoodVariantRepository = async (id) => {
    try {
        const deletedVariant = await prisma.foodVariant.delete({
            where: { id },
        });
        return deletedVariant;
    } catch (error) {
        console.error("Error deleting food variant:", error);
        throw error;
    }
};


// vrati variantu podle title v danem katalogu pro daneho uzivatele
export const getFoodVariantByTitleRepository = async (title, foodCatalogId, userId, isDeleted = false) => {
    try {
        const variant = await prisma.foodVariant.findFirst({
            where: {
                title: title,
                foodCatalogId: foodCatalogId,
                addedBy: userId,
                isDeleted: isDeleted !== null ? isDeleted : undefined,
            },
        });
        return variant;
    } catch (error) {
        console.error("Error fetching food variant by title:", error);
        throw error;
    }
};