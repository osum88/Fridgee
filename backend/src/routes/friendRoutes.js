import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, deleteFriend } from "../controllers/friendController.js";

const router = express.Router();

router.post("/add", authenticateToken, addFriend);
router.delete("/:id", authenticateToken, deleteFriend);
router.delete("/", authenticateToken, deleteFriend);
router.put("/accept", authenticateToken, acceptFriend);

export default router;

