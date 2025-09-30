import express from "express";
import { authenticateToken, authorizeAdmin, authorizeAdminWithOutId } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import { deleteUser, deleteUserProfileImage, getAllUsersAdmin, getUserById, updateUser, updateUserProfileImage } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { updateUserSchema } from "../validation/userValidation.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, getAllFoodInventory, getInventoryDetailsWithUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { archiveInventoryAdminSchema, changeRoleAdminSchema, changeSettingAdminSchema, createFoodInventoryAdminSchema, createInventoryUserAdminSchema, deleteAdminSchema, getInventoryUsersSchema, updateFoodInventorySchema } from "../validation/foodInventoryValidation.js";
import { getFriendsAdminSchema } from "../validation/friendValidation.js";
import multer from "multer";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//                                 FRIENDSHIP
//pridani do pratel
router.post("/users/:id/friends/add", authenticateToken, authorizeAdmin, addFriend);

//zruseni zadosti
router.delete("/users/:id/friends/cancel/:friendId", authenticateToken, authorizeAdmin, cancelRequestFriend);

//odstraneni nekoho z pratel
router.delete("/users/:id/friends/:friendId", authenticateToken, authorizeAdmin, deleteFriend);

//akceptovani zadosti
router.patch("/users/:id/friends/accept/:friendId", authenticateToken, authorizeAdmin, acceptFriend);

//seznam vsech odeslanych zadosti
router.get("/users/:id/friends/requests/sent", validate(getFriendsAdminSchema), authenticateToken, sanitize, authorizeAdmin, getSentFriendRequests);

//seznam vsech prijatych zadosti
router.get("/users/:id/friends/requests/received", validate(getFriendsAdminSchema), authenticateToken, sanitize, authorizeAdmin, getReceivedFriendRequests);

//seznam vsech pratel
router.get("/users/:id/friends", validate(getFriendsAdminSchema), authenticateToken, sanitize, authorizeAdmin, getAllFriends);


//                               FOOD INVENTORY
//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/users/:id/inventory", validate(createFoodInventoryAdminSchema), authenticateToken, sanitize, authorizeAdmin, createFoodInventory);

//vytvori inventory user nastaveny jako USER
router.post("/users/:id/inventory/:inventoryId/users", validate(createInventoryUserAdminSchema),  authenticateToken, sanitize, authorizeAdmin, createInventoryUser);

//zmena settings usera
router.patch("/users/:id/inventory/:inventoryId/users/settings", validate(changeSettingAdminSchema), authenticateToken, sanitize, authorizeAdmin, changeSettingFoodInventoryUser);

//meni roli user v inventari
router.patch("/users/:id/inventory/:inventoryId/users/:targetUserId", validate(changeRoleAdminSchema), authenticateToken, sanitize, authorizeAdmin, changeRoleInventoryUser);

//smaze uzivatele z inventare
router.delete("/users/:id/inventory/:inventoryId/users/", validate(deleteAdminSchema), authenticateToken, authorizeAdmin, deleteFoodInventoryUser);

//vrati uzivatele podle role
router.get("/users/inventory/:inventoryId/users", validate(getInventoryUsersSchema), authenticateToken, sanitize, authorizeAdminWithOutId, getUsersByInventoryId);

//archivuje inventar
router.patch("/users/:id/inventory/:inventoryId/archive", validate(archiveInventoryAdminSchema), authenticateToken, authorizeAdmin, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/users/:id/inventory/:inventoryId/unarchive", validate(archiveInventoryAdminSchema), authenticateToken, authorizeAdmin, unarchiveFoodInventory);

//zmena title a label
router.patch("/users/inventory/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, sanitize, authorizeAdminWithOutId, updateFoodInventory);

//vrati vsechny inventare uzivatele
router.get("/users/:id/inventory", authenticateToken, authorizeAdmin, getAllFoodInventory);

//ziska detail inventare s opravnenim 
router.get("/users/:id/inventory/:inventoryId", validate(archiveInventoryAdminSchema), authenticateToken, sanitize, authorizeAdmin, getInventoryDetailsWithUser);


//                                 USER
//vrati uzivatele podle id
router.get("/users/:id", authenticateToken, authorizeAdmin, getUserById);   

//vrati vsechny uzivatele
router.get("/users", authenticateToken, authorizeAdminWithOutId, getAllUsersAdmin);   

//zmeni profile image
router.patch("/users/:id/profile-image", authenticateToken, authorizeAdmin, upload.single("file"), updateUserProfileImage);

//smaže profile image
router.delete("/users/:id/profile-image", authenticateToken, authorizeAdmin, deleteUserProfileImage);

//updatuje uzivatele
router.patch("/users/:id", validate(updateUserSchema), authenticateToken, sanitize, authorizeAdmin, updateUser);

//smaze uzivatele
router.delete("/users/:id", authenticateToken, authorizeAdmin, deleteUser);



export default router;