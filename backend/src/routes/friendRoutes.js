import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriend, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";

const router = express.Router();

router.post("/add", authenticateToken, addFriend);
router.delete("/cancel/:friendId", authenticateToken, cancelRequestFriend);          
router.delete("/:friendId", authenticateToken, deleteFriend);              
router.put("/accept/:friendId", authenticateToken, acceptFriend);


router.get("/requests/sent", authenticateToken, getSentFriendRequests);
router.get("/requests/received", authenticateToken, getReceivedFriendRequests);
router.get("/", authenticateToken, getAllFriend);

export default router;

