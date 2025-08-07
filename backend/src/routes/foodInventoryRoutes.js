import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { changeRoleInventoryUser, createFoodInventory, createInventoryUser } from "../controllers/foodInventoryController.js";

const router = express.Router();

//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/", authenticateToken, authorizeUser, createFoodInventory);

//inventory user nastaveny jako USER            asi odstranit tuto routu
router.post("/:inventoryId/users", authenticateToken, authorizeUser, createInventoryUser);

//meni roli user v inventari
router.patch("/:inventoryId/users/:userId", authenticateToken, authorizeUser, changeRoleInventoryUser);

export default router;