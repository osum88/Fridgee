import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodToInventory, updateFood } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema, updateFoodSchema } from "../validation/foodValidation.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// prida jidlo do inventare a vytvori instanci, price i history, pripadne catalog, label, variant
router.post("/", validate(addFoodToInventoryFoodSchema), authenticateToken, sanitize, authorizeUser, upload.single("file"), addFoodToInventory);

// updatuje food, categorii a label food
router.patch("/", validate(updateFoodSchema), authenticateToken, sanitize, authorizeUser, upload.single("file"), updateFood);



export default router;

