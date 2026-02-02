import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodToInventory } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema } from "../validation/foodValidation.js";
import { consumeFoodInstanceSchema } from "../validation/foodInstanceValidation.js";
import { consumeFoodInstance } from "../controllers/foodInstanceController.js";

const router = express.Router();

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
router.patch("/consume", validate(consumeFoodInstanceSchema), authenticateToken, sanitize, authorizeUser , consumeFoodInstance);




export default router;

