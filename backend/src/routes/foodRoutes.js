import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodToInventory, updateFood } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema, updateFoodFoodSchema } from "../validation/foodValidation.js";

const router = express.Router();

// prida jidlo do inventare a vytvori instanci, price i history, pripadne catalog, label, variant
router.post("/", validate(addFoodToInventoryFoodSchema), authenticateToken, sanitize, authorizeUser, addFoodToInventory);

// updatuje food, categorii a label food
router.patch("/", validate(updateFoodFoodSchema), authenticateToken, sanitize, authorizeUser, updateFood);



export default router;

