import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { createFoodVariant, deleteFoodVariant, getFoodVariantById, getFoodVariantsContext, updateFoodVariant } from "../controllers/foodVariantController.js";
import { createFoodVariantSchema, foodVariantIdSchema, updateFoodVariantSchema } from "../validation/foodVariantValidation.js";
import { foodCatalogIdSchema } from "../validation/foodCatalogValidation.js";

const router = express.Router();

// vytvori novou variantu
router.post("/", validate(createFoodVariantSchema), authenticateToken, sanitize, authorizeUser, createFoodVariant);

// vrati vsechny varianty usera nebo ty co se pouzivaji v inventari
router.get("/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeUser, getFoodVariantsContext);

// vrati variantu podle jejiho ID
router.get("/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeUser, getFoodVariantById);

// updatuje variantu
router.patch("/:variantId", validate(updateFoodVariantSchema), authenticateToken, sanitize, authorizeUser, updateFoodVariant);

// smaze variantu
router.delete("/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodVariant);

export default router;





