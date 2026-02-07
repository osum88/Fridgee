import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import {  deleteFoodVariant, getFoodVariantById, getFoodVariantsContext,  } from "../controllers/foodVariantController.js";
import {  foodVariantIdSchema,  } from "../validation/foodVariantValidation.js";
import { foodCatalogIdSchema } from "../validation/foodCatalogValidation.js";

const router = express.Router();


// vrati vsechny varianty usera nebo ty co se pouzivaji v inventari
router.get("/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeUser, getFoodVariantsContext);

// vrati variantu podle jejiho ID
router.get("/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeUser, getFoodVariantById);

// smaze variantu
router.delete("/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodVariant);

export default router;





