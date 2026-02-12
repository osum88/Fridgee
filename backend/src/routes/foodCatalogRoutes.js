import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import {  foodCatalogWithLabelByBarcodeSchema } from "../validation/foodCatalogValidation.js";
import {  getFoodCatalogWithLabelByBarcode, } from "../controllers/foodCatalogController.js";

const router = express.Router();

// vrati katalog, label a variant podle barcodu
router.get("/barcode/:barcode", validate(foodCatalogWithLabelByBarcodeSchema), authenticateToken, sanitize, authorizeUser, getFoodCatalogWithLabelByBarcode);
// /api/food-catalog/barcode/:barcode?inventoryId=123

export default router;



