import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodToInventory, updateFood } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema, updateFoodSchema } from "../validation/foodValidation.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);
router.use(authorizeUser);

// prida jidlo do inventare a vytvori instanci, price i history, pripadne catalog, label, variant
router.post("/",  upload.single("file"), sanitize, validate(addFoodToInventoryFoodSchema), addFoodToInventory);

// updatuje food, categorii a label food
router.patch("/", upload.single("file"), sanitize, validate(updateFoodSchema), updateFood);



export default router;

