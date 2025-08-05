import express from "express";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriend, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";

const router = express.Router();

//friendship
router.post('/users/:id/friends/add/', authenticateToken, authorizeAdmin, addFriend);
router.delete('/users/:id/friends/cancel/:friendId', authenticateToken, authorizeAdmin, cancelRequestFriend);
router.delete('/users/:id/friends/:friendId', authenticateToken, authorizeAdmin, deleteFriend);
router.put('/users/:id/friends/accept/:friendId', authenticateToken, authorizeAdmin, acceptFriend);
router.get('/users/:id/friends/requests/sent', authenticateToken, authorizeAdmin, getSentFriendRequests);
router.get('/users/:id/friends/requests/received', authenticateToken, authorizeAdmin, getReceivedFriendRequests);
router.get('/users/:id/friends', authenticateToken, authorizeAdmin, getAllFriend);

//food inventory
// router.post("/admin/inventory", authenticateToken, checkAdminRole, createFoodInventoryAsAdmin);
// router.post('/admin/:inventoryId/users', authenticateToken, checkAdminRole, createInventoryUserAsAdmin);
// router.patch('/admin/:inventoryId/users/:userId', authenticateToken, checkAdminRole, changeRoleInventoryUserAsAdmin);


export default router;