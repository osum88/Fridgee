import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import {  foodCatalogWithLabelByBarcodeSchema } from "../validation/foodCatalogValidation.js";
import {  getFoodCatalogWithLabelByBarcode, } from "../controllers/foodCatalogController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeUser);
router.use(sanitize);

// vrati katalog, label a variant podle barcodu
router.get("/barcode/:barcode", validate(foodCatalogWithLabelByBarcodeSchema), getFoodCatalogWithLabelByBarcode);
// /api/food-catalog/barcode/:barcode?inventoryId=123

export default router;



