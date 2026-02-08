import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { deleteFoodLabel, updateFoodLabel } from "../controllers/foodLabelController.js";
import { foodLabelIdSchema, updateFoodLabelSchema } from "../validation/foodLabelValidation.js";

const router = express.Router();

// updatuje uzivateluv food label
router.patch("/", validate(updateFoodLabelSchema), authenticateToken, sanitize, authorizeUser, updateFoodLabel);

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
router.delete("/:foodLabelId", validate(foodLabelIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodLabel);

export default router;
