import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { deleteFoodLabel, getAvailableFoodLabelsController, updateFoodLabel } from "../controllers/foodLabelController.js";
import { availableFoodLabelsSchema, foodLabelIdSchema, updateFoodLabelSchema } from "../validation/foodLabelValidation.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });


// updatuje uzivateluv food label
router.patch("/", validate(updateFoodLabelSchema), authenticateToken, sanitize, authorizeUser, upload.single("file"), updateFoodLabel);

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
router.delete("/:foodLabelId", validate(foodLabelIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodLabel);

//vrati vsechny userovi labely a vsechny co se pouzivaji v neajkem inventari
router.get('/available', validate(availableFoodLabelsSchema), authenticateToken, sanitize, authorizeUser, getAvailableFoodLabelsController);
// /api/food-label/available?page=1&limit=50

export default router;
