import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { consumeFoodInstanceSchema, updateFoodInstanceSchema } from "../validation/foodInstanceValidation.js";
import { consumeMultipleFoodInstances, updateFoodInstance } from "../controllers/foodInstanceController.js";

const router = express.Router();

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
router.patch("/consume", validate(consumeFoodInstanceSchema), authenticateToken, sanitize, authorizeUser , consumeMultipleFoodInstances);

//updatuje jednu nebo vice stejnych instanci
router.patch("/", validate(updateFoodInstanceSchema), authenticateToken, sanitize, authorizeUser , updateFoodInstance);




export default router;

