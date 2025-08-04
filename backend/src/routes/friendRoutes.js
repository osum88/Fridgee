import express from "express";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriend, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";

const router = express.Router();

router.post("/add", authenticateToken, addFriend);
router.delete('/cancel/', authenticateToken, cancelRequestFriend);          
router.delete("/", authenticateToken, deleteFriend);              
router.put("/accept", authenticateToken, acceptFriend);

router.get('/requests/sent/:id', authenticateToken, getSentFriendRequests);
router.get('/requests/sent/', authenticateToken, getSentFriendRequests);
router.get('/requests/received/:id', authenticateToken, getReceivedFriendRequests);
router.get('/requests/received/', authenticateToken, getReceivedFriendRequests);
router.get('/:id', authenticateToken, getAllFriend);
router.get('/', authenticateToken, getAllFriend);

export default router;

