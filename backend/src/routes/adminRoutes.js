import express from "express";
import { authenticateToken, authorizeAdmin, authorizeAdminWithOutId } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import { deleteUser, getAllUsersAdmin, getUserById, updateUser } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { updateUserSchema } from "../validation/userValidation.js";
import { changeRoleInventoryUser, createFoodInventory, createInventoryUser, deleteOtherFoodInventoryUser } from "../controllers/foodInventoryController.js";
import { changeRoleAdminSchema, createFoodInventoryAdminSchema, createInventoryUserAdminSchema, deleteOtherAdminSchema } from "../validation/foodInventoryValidation.js";

const router = express.Router();


//                                 FRIENDSHIP
//pridani do pratel
router.post("/users/:id/friends/add", authenticateToken, authorizeAdmin, addFriend);

//zruseni zadosti
router.delete("/users/:id/friends/cancel/:friendId", authenticateToken, authorizeAdmin, cancelRequestFriend);

//odstraneni nekoho z pratel
router.delete("/users/:id/friends/:friendId", authenticateToken, authorizeAdmin, deleteFriend);

//akceptovani zadosti
router.put("/users/:id/friends/accept/:friendId", authenticateToken, authorizeAdmin, acceptFriend);

//seznam vsech odeslanych zadosti
router.get("/users/:id/friends/requests/sent", authenticateToken, authorizeAdmin, getSentFriendRequests);

//seznam vsech prijatych zadosti
router.get("/users/:id/friends/requests/received", authenticateToken, authorizeAdmin, getReceivedFriendRequests);

//seznam vsech pratel
router.get("/users/:id/friends", authenticateToken, authorizeAdmin, getAllFriends);


//                               FOOD INVENTORY
//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/users/:id/inventory", validate(createFoodInventoryAdminSchema), authenticateToken, authorizeAdmin, createFoodInventory);

//vytvori inventory user nastaveny jako USER
router.post("/users/:id/inventory/:inventoryId/users", validate(createInventoryUserAdminSchema),  authenticateToken, authorizeAdmin, createInventoryUser);

//meni roli user v inventari
router.patch("/users/:id/inventory/:inventoryId/users/:targetUserId", validate(changeRoleAdminSchema), authenticateToken, authorizeAdmin, changeRoleInventoryUser);

//smaze jineho uzivatele z inventare
router.delete("/users/:id/inventory/:inventoryId/users/:targetUserId", validate(deleteOtherAdminSchema), authenticateToken, authorizeAdmin, deleteOtherFoodInventoryUser);


//                                 USER
//vrati uzivatele podle id
router.get("/users/:id", authenticateToken, authorizeAdmin, getUserById);   

//vrati vsechny uzivatele
router.get("/users", authenticateToken, authorizeAdminWithOutId, getAllUsersAdmin);   

//updatuje uzivatele
router.put("/users/:id", validate(updateUserSchema), authenticateToken, authorizeAdmin, updateUser);

//smaze uzivatele
router.delete("/users/:id", authenticateToken, authorizeAdmin, deleteUser);



export default router;