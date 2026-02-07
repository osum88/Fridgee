import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { updateFoodLabel } from "../controllers/foodLabelController.js";
import { updateFoodLabelSchema } from "../validation/foodLabelValidation.js";

const router = express.Router();

// updatuje uzivateluv food label
router.patch("/", validate(updateFoodLabelSchema), authenticateToken, sanitize, authorizeUser, updateFoodLabel);

export default router;
