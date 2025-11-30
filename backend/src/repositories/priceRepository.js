import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// vytvori novou cenu
export const createPriceRepository = async (data) => {
    try {
        const newPrice = await prisma.price.create({
            data,
        });
        return newPrice;
    } catch (error) {
        console.error("Error creating price:", error);
        throw error;
    }
};

// nacte cenu podle id
export const getPriceByIdRepository = async (id) => {
    try {
        const price = await prisma.price.findUnique({
            where: { id },
        });
        if (!price) {
            throw new NotFoundError("Price not found.");
        }
        return price;
    } catch (error) {
        console.error("Error fetching price:", error);
        throw error;
    }
};

// aktualizuje cenu podle id
export const updatePriceRepository = async (id, data) => {
    try {
        const updatedPrice = await prisma.price.update({
            where: { id },
            data,
        });
        return updatedPrice;
    } catch (error) {
        console.error("Error updating price:", error);
        throw error;
    }
};

// smaze cenu podle id
export const deletePriceRepository = async (id) => {
    try {
        const deletedPrice = await prisma.price.delete({
            where: { id },
        });
        return deletedPrice;
    } catch (error) {
        console.error("Error deleting price:", error);
        throw error;
    }
};
