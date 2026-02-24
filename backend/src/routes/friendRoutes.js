import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import validate from "../middlewares/validator.js";
import { getFriendsSchema } from "../validation/friendValidation.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeUser);
router.use(sanitize);

//pridani do pratel
router.post("/add", addFriend);

//zruseni zadosti
router.delete("/cancel/:friendId", cancelRequestFriend);      

//odstraneni nekoho z pratel
router.delete("/:friendId", deleteFriend);            

//akceptovani zadosti
router.patch("/accept/:friendId", acceptFriend);

//seznam vsech odeslanych zadosti
router.get("/requests/sent", validate(getFriendsSchema), getSentFriendRequests);

//seznam vsech prijatych zadosti
router.get("/requests/received", validate(getFriendsSchema), getReceivedFriendRequests);

//seznam vsech pratel
router.get("/", validate(getFriendsSchema), getAllFriends);

export default router;

