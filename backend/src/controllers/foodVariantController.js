import { createFoodVariantService, deleteFoodVariantService, getFoodVariantByIdService, getFoodVariantsContextService, updateFoodVariantService } from "../services/foodVariantService.js";
import handleResponse from "../utils/responseHandler.js";

// vytvori novou variantu k jidlu
export const createFoodVariant = async (req, res, next) => {
    try {
        const { title, foodCatalogId } = req.body;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const variant = await createFoodVariantService(title, Number(foodCatalogId), userId, isAdmin);
        handleResponse(res, 201, "Food variant created successfully", variant);
    } catch (err) {
        next(err);
    }
};

// vrati variantu podle jejiho ID
export const getFoodVariantById = async (req, res, next) => {
    try {
        const { variantId } = req.params;

        const variant = await getFoodVariantByIdService(Number(variantId));
        handleResponse(res, 200, "Food variant fetched successfully", variant);
    } catch (err) {
        next(err);
    }
};

// vraci vsechny varianty katalogu podle kontextu (admin vs user)
export const getFoodVariantsContext = async (req, res, next) => {
    try {
        const { foodCatalogId } = req.params;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const variants = await getFoodVariantsContextService(Number(foodCatalogId), userId, isAdmin);
        handleResponse(res, 200, "All food variants fetched successfully", variants);
    } catch (err) {
        next(err);
    }
};

// aktualizuje název varianty
export const updateFoodVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params; 
        const { title } = req.body;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const updatedVariant = await updateFoodVariantService(Number(variantId), title, userId, isAdmin);
        handleResponse(res, 200, "Food variant updated successfully", updatedVariant);
    } catch (err) {
        next(err);
    }
};

// smaze variantu 
export const deleteFoodVariant = async (req, res, next) => {
    try {
        const { variantId } = req.params; 
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        await deleteFoodVariantService(Number(variantId), userId, isAdmin);
        handleResponse(res, 200, "Food variant deleted successfully");
    } catch (err) {
        next(err);
    }
};