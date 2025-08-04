import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { createFoodInventory } from "../controllers/foodInventoryController.js";

const router = express.Router();

router.post("/", authenticateToken, createFoodInventory);

export default router;