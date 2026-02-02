import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodToInventory } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema } from "../validation/foodValidation.js";

const router = express.Router();

// prida jidlo do inventare a vytvori instanci, price i history
router.post("/", validate(addFoodToInventoryFoodSchema), authenticateToken, sanitize, authorizeUser, addFoodToInventory);




export default router;

