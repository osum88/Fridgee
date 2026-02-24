import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { createFoodCategory, deleteFoodCategory,  getFoodCategoryById, updateFoodCategory } from "../controllers/foodCategoryController.js";
import { categoryIdSchema, createFoodCategorySchema, updateFoodCategorySchema } from "../validation/foodCategoryValidation.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeUser);
router.use(sanitize);

// vytvori novou kategorii
router.post("/", validate(createFoodCategorySchema), createFoodCategory);

// vrati kategorii podle id
router.get("/:categoryId", validate(categoryIdSchema), getFoodCategoryById);


// updatuje kategorii podle id
router.patch("/:categoryId", validate(updateFoodCategorySchema), updateFoodCategory);

// smaze kategorii podle id
router.delete("/:categoryId", validate(categoryIdSchema), deleteFoodCategory);

export default router;

