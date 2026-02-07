import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { foodCatalogIdSchema } from "../validation/foodCatalogValidation.js";
import { getAllFoodCatalogsByUser, getFoodCatalogById, } from "../controllers/foodCatalogController.js";

const router = express.Router();


// vrati katalog podle id
router.get("/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeUser, getFoodCatalogById);

// vrati vsechny katalogy usera
router.get("/", authenticateToken, authorizeUser, getAllFoodCatalogsByUser);



export default router;



