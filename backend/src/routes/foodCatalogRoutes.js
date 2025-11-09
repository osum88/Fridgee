import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { createFoodCatalogSchema, foodCatalogIdSchema, updateFoodCatalogSchema } from "../validation/foodCatalogValidation.js";
import { createFoodCatalog } from "../controllers/foodCatalogController.js";

const router = express.Router();

//vytvori food catalog
router.post("/", validate(createFoodCatalogSchema), authenticateToken, sanitize, authorizeUser, createFoodCatalog);

// vrati katalog podle id
// router.get("/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeUser, getFoodCatalogById);

// // vrati vsechny katalogy usera
// router.get("/", authenticateToken, authorizeUser, getAllFoodCatalogsByUser);

// //smaze katalog podle id
// router.delete("/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeUser, deleteFoodCatalog);

// //updatuje katalog podle id
// router.patch("/:foodCatalogId", validate(updateFoodCatalogSchema), authenticateToken, sanitize, authorizeUser, updateFoodCatalog);

export default router;



