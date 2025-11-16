import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { createFoodCategory, deleteFoodCategory, getFoodCategoriesByInventory, getFoodCategoryById, updateFoodCategory } from "../controllers/foodCategoryController.js";
import { inventoryIdSchema } from "../validation/foodInventoryValidation.js";
import { categoryIdSchema, createFoodCategorySchema, updateFoodCategorySchema } from "../validation/foodCategoryValidation.js";

const router = express.Router();

// vytvori novou kategorii
router.post("/", validate(createFoodCategorySchema), authenticateToken, sanitize, authorizeUser, createFoodCategory);

// vrati kategorii podle id
router.get("/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeUser, getFoodCategoryById);

// vrati vsechny kategorie z inventare
router.get("/inventory/:inventoryId", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeUser, getFoodCategoriesByInventory);

// updatuje kategorii podle id
router.patch("/:categoryId", validate(updateFoodCategorySchema), authenticateToken, sanitize, authorizeUser, updateFoodCategory);

// smaze kategorii podle id
router.delete("/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodCategory);

export default router;
