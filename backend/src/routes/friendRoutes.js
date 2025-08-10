import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";

const router = express.Router();

//pridani do pratel
router.post("/add", authenticateToken, authorizeUser, addFriend);

//zruseni zadosti
router.delete("/cancel/:friendId", authenticateToken, authorizeUser, cancelRequestFriend);      

//odstraneni nekoho z pratel
router.delete("/:friendId", authenticateToken, authorizeUser, deleteFriend);            

//akceptovani zadosti
router.patch("/accept/:friendId", authenticateToken, authorizeUser, acceptFriend);

//seznam vsech odeslanych zadosti
router.get("/requests/sent", authenticateToken, authorizeUser, getSentFriendRequests);

//seznam vsech prijatych zadosti
router.get("/requests/received", authenticateToken, authorizeUser, getReceivedFriendRequests);

//seznam vsech pratel
router.get("/", authenticateToken, authorizeUser, getAllFriends);

export default router;

