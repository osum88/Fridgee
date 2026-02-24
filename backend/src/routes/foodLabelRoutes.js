import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import {
  deleteFoodLabel,
  getAvailableFoodLabels,
  updateFoodLabel,
} from "../controllers/foodLabelController.js";
import {
  availableFoodLabelsSchema,
  foodLabelIdSchema,
  updateFoodLabelSchema,
} from "../validation/foodLabelValidation.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);
router.use(authorizeUser);

// updatuje uzivateluv food label
router.patch(
  "/",
  upload.single("file"),
  sanitize,
  validate(updateFoodLabelSchema),
  updateFoodLabel,
);

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
router.delete("/:foodLabelId", sanitize, validate(foodLabelIdSchema), deleteFoodLabel);

//vrati vsechny userovi labely a vsechny co se pouzivaji v neajkem inventari
router.get("/available", sanitize, validate(availableFoodLabelsSchema), getAvailableFoodLabels);
// /api/food-label/available?page=1&limit=50

export default router;
