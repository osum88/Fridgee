import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import validate from "../middlewares/validator.js";
import { getFriendsSchema } from "../validation/friendValidation.js";
import { sanitize } from "../middlewares/sanitize.js";

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
router.get("/requests/sent", validate(getFriendsSchema), authenticateToken, sanitize, authorizeUser, getSentFriendRequests);

//seznam vsech prijatych zadosti
router.get("/requests/received", validate(getFriendsSchema), authenticateToken, sanitize, authorizeUser, getReceivedFriendRequests);

//seznam vsech pratel
router.get("/", validate(getFriendsSchema), authenticateToken, sanitize, authorizeUser, getAllFriends);

export default router;

