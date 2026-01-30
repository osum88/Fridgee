import express from "express";
import { authenticateToken, authorizeAdmin, authorizeAdminWithOutId } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import { deleteUser, deleteUserProfileImage, getAllUsersAdmin, getUserById, updateUser, updateUserProfileImage } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { updateUserAdminSchema, userIdAdminSchema } from "../validation/userValidation.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, getAllFoodInventory, getInventoryDetailsWithUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { inventoryIdAdminSchema, changeRoleAdminSchema, changeSettingAdminSchema, createFoodInventoryAdminSchema, createInventoryUserAdminSchema, deleteAdminSchema, getInventoryUsersSchema, updateFoodInventorySchema, inventoryIdSchema } from "../validation/foodInventoryValidation.js";
import { getFriendsAdminSchema } from "../validation/friendValidation.js";
import multer from "multer";
import { sanitize } from "../middlewares/sanitize.js";
import { createFoodCatalogAdminSchema, foodCatalogIdSchema, updateFoodCatalogSchema } from "../validation/foodCatalogValidation.js";
import { createFoodCatalog, deleteFoodCatalog, getAllFoodCatalogsByUser, getFoodCatalogById, updateFoodCatalog } from "../controllers/foodCatalogController.js";
import { categoryIdSchema, createFoodCategorySchema, updateFoodCategorySchema } from "../validation/foodCategoryValidation.js";
import { createFoodCategory, deleteFoodCategory, getFoodCategoriesByInventory, getFoodCategoryById, updateFoodCategory } from "../controllers/foodCategoryController.js";
import { deleteFoodVariant, getFoodVariantsContext, updateFoodVariant } from "../controllers/foodVariantController.js";
import { createFoodVariantSchema, foodVariantIdSchema, updateFoodVariantSchema } from "../validation/foodVariantValidation.js";


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
router.patch("/users/:id/inventory/:inventoryId/archive", validate(inventoryIdAdminSchema), authenticateToken, authorizeAdmin, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/users/:id/inventory/:inventoryId/unarchive", validate(inventoryIdAdminSchema), authenticateToken, authorizeAdmin, unarchiveFoodInventory);

//zmena title a label
router.patch("/users/inventory/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, sanitize, authorizeAdminWithOutId, updateFoodInventory);

//vrati vsechny inventare uzivatele
router.get("/users/:id/inventory", authenticateToken, authorizeAdmin, getAllFoodInventory);

//ziska detail inventare s opravnenim 
router.get("/users/:id/inventory/:inventoryId", validate(inventoryIdAdminSchema), authenticateToken, sanitize, authorizeAdmin, getInventoryDetailsWithUser);

// vrati vsechny kategorie z inventare
router.get("/inventory/:inventoryId/food-category", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, getFoodCategoriesByInventory);


//                         FOOD CATALOG
//vytvori food catalog
router.post("/users/:id/food-catalog", validate(createFoodCatalogAdminSchema), authenticateToken, sanitize, authorizeAdmin, createFoodCatalog);

// vrati katalog podle id
router.get("/users/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, getFoodCatalogById);

// vrati vsechny katalogy usera
router.get("/users/:id/food-catalog", validate(userIdAdminSchema), authenticateToken, authorizeAdmin, getAllFoodCatalogsByUser);

//smaze katalog podle id
router.delete("/users/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, deleteFoodCatalog);

//updatuje katalog podle id
router.patch("/users/food-catalog/:foodCatalogId", validate(updateFoodCatalogSchema), authenticateToken, sanitize, authorizeAdminWithOutId, updateFoodCatalog);

//                                 FOOO CATEGORY
// vytvori novou kategorii
router.post("/food-category", validate(createFoodCategorySchema), authenticateToken, sanitize, authorizeAdminWithOutId, createFoodCategory);

// vrati kategorii podle id
router.get("/food-category/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, getFoodCategoryById);

// updatuje kategorii podle id
router.patch("/food-category/:categoryId", validate(updateFoodCategorySchema), authenticateToken, sanitize, authorizeAdminWithOutId, updateFoodCategory);

// smaze kategorii podle id
router.delete("/food-category/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, deleteFoodCategory);


//                       FOOD VARIANT
// vrati vsechny varianty usera nebo ty co se pouzivaji v inventari
router.get("/food-variant/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, getFoodVariantsContext);

// updatuje variantu
router.patch("/food-variant/:variantId", validate(updateFoodVariantSchema), authenticateToken, sanitize, authorizeAdminWithOutId, updateFoodVariant);

// smaze variantu
router.delete("/food-variant/:variantId", validate(foodVariantIdSchema), authenticateToken, sanitize, authorizeAdminWithOutId, deleteFoodVariant);


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
router.patch("/users/:id", validate(updateUserAdminSchema), authenticateToken, sanitize, authorizeAdmin, updateUser);

//smaze uzivatele
router.delete("/users/:id", validate(userIdAdminSchema), authenticateToken, authorizeAdmin, deleteUser);



export default router;