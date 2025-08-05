import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { changeRoleInventoryUser, createFoodInventory, createInventoryUser } from "../controllers/foodInventoryController.js";

const router = express.Router();

router.post("/", authenticateToken, createFoodInventory);
router.post('/:inventoryId/users', authenticateToken, createInventoryUser);
router.patch('/:inventoryId/users/:userId', authenticateToken, changeRoleInventoryUser);

export default router;