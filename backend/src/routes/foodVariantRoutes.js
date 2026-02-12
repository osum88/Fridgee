import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { getFoodVariantById } from "../controllers/foodVariantController.js";
import { foodVariantIdSchema } from "../validation/foodVariantValidation.js";

const router = express.Router();

// vrati variantu podle jejiho ID
router.get("/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeUser, getFoodVariantById);

export default router;





