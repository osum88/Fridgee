import express from "express";
import validate from "../middlewares/validator.js";
import multer from "multer";
import { authenticateToken, authorizeAdmin, authorizeAdminWithoutUserId } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import { deleteUser, deleteUserProfileImage, getAllUsersAdmin, getUserById, updateUser, updateUserProfileImage } from "../controllers/userController.js";
import { updateUserAdminSchema, userIdAdminSchema } from "../validation/userValidation.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, getAllFoodInventory, getInventoryContent, getInventoryDetailsWithUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { inventoryIdAdminSchema, changeRoleAdminSchema, changeSettingAdminSchema, createFoodInventoryAdminSchema, createInventoryUserAdminSchema, deleteAdminSchema, getInventoryUsersSchema, updateFoodInventorySchema, inventoryIdSchema, searchInventoryLabelAdminSchema } from "../validation/foodInventoryValidation.js";
import { getFriendsAdminSchema } from "../validation/friendValidation.js";
import { sanitize } from "../middlewares/sanitize.js";
import { foodCatalogIdSchema, foodCatalogWithLabelByBarcodeSchema,  } from "../validation/foodCatalogValidation.js";
import { getFoodCatalogWithLabelByBarcode } from "../controllers/foodCatalogController.js";
import { categoryIdSchema, createFoodCategorySchema, updateFoodCategorySchema } from "../validation/foodCategoryValidation.js";
import { createFoodCategory, deleteFoodCategory, getFoodCategoriesByInventory, getFoodCategoryById, updateFoodCategory } from "../controllers/foodCategoryController.js";
import { getAllFoodVariantsCatalog } from "../controllers/foodVariantController.js";
import { addFoodToInventory,  updateFood } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema, updateFoodSchema } from "../validation/foodValidation.js";
import { consumeMultipleFoodInstances, deleteFoodInstances, duplicateFoodInstances, updateFoodInstance } from "../controllers/foodInstanceController.js";
import { consumeFoodInstanceSchema, deleteFoodInstancesSchema, duplicateInstancesSchema, updateFoodInstanceSchema } from "../validation/foodInstanceValidation.js";
import { deleteFoodLabel, getLabelSuggestions, updateFoodLabel } from "../controllers/foodLabelController.js";
import { foodLabelIdSchema, updateFoodLabelSchema } from "../validation/foodLabelValidation.js";


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
router.get("/users/inventory/:inventoryId/users", validate(getInventoryUsersSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getUsersByInventoryId);

//archivuje inventar
router.patch("/users/:id/inventory/:inventoryId/archive", validate(inventoryIdAdminSchema), authenticateToken, authorizeAdmin, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/users/:id/inventory/:inventoryId/unarchive", validate(inventoryIdAdminSchema), authenticateToken, authorizeAdmin, unarchiveFoodInventory);

//zmena title a label
router.patch("/users/inventory/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, updateFoodInventory);

// vrati vsechny kategorie z inventare
router.get("/inventory/:inventoryId/food-category", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getFoodCategoriesByInventory);

// vrati vsechny jidla s kategoriemi, instancemi a labely
router.get("/inventory/:inventoryId/content", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getInventoryContent);

//ziska detail inventare s opravnenim 
router.get("/users/:id/inventory/:inventoryId", validate(inventoryIdAdminSchema), authenticateToken, sanitize, authorizeAdmin, getInventoryDetailsWithUser);

//vrati vsechny inventare uzivatele
router.get("/users/:id/inventory", authenticateToken, authorizeAdmin, getAllFoodInventory);

//hleda jidlo podle stringu
router.get("/users/:id/inventory/:inventoryId/suggestions", validate(searchInventoryLabelAdminSchema), authenticateToken, sanitize, authorizeAdmin, getLabelSuggestions);
// /api/admin/users/78/inventory/19/suggestions?title=apple&limit=5

//                         FOOD CATALOG

// vrati katalog, label a variant podle barcodu
router.get("/food-catalog/barcode/:barcode", validate(foodCatalogWithLabelByBarcodeSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getFoodCatalogWithLabelByBarcode);
// /api/admin/food-catalog/barcode/:barcode?inventoryId=123



//                                 FOOO CATEGORY
// vytvori novou kategorii
router.post("/food-category", validate(createFoodCategorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, createFoodCategory);

// vrati kategorii podle id
router.get("/food-category/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getFoodCategoryById);

// updatuje kategorii podle id
router.patch("/food-category/:categoryId", validate(updateFoodCategorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, updateFoodCategory);

// smaze kategorii podle id
router.delete("/food-category/:categoryId", validate(categoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, deleteFoodCategory);


//                       FOOD VARIANT
// vrati vsechny varianty usera nebo ty co se pouzivaji v inventari
router.get("/food-variant/food-catalog/:foodCatalogId", validate(foodCatalogIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getAllFoodVariantsCatalog);


//                          FOOD

// prida jidlo do inventare a vytvori instanci, price i history, pripadne catalog, label, variant
router.post("/food", validate(addFoodToInventoryFoodSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, addFoodToInventory);

// updatuje food, categorii a label food
router.patch("/", validate(updateFoodSchema),  authenticateToken, sanitize, authorizeAdminWithoutUserId, updateFood);

//                          FOOD INSTANCE

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
router.patch("/food-instance/consume", validate(consumeFoodInstanceSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, consumeMultipleFoodInstances);

//updatuje jednu nebo vice stejnych instanci
router.patch("/food-instance", validate(updateFoodInstanceSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId , updateFoodInstance);

//duplikuje instance food
router.post("/food-instance/duplicate", validate(duplicateInstancesSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, duplicateFoodInstances);

//smaze jednu nebo vice instanci
router.delete("/food-instance", validate(deleteFoodInstancesSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, deleteFoodInstances);


//                          FOOD LABEL

// updatuje uzivateluv food label
router.patch("/food-label", validate(updateFoodLabelSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, updateFoodLabel);

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
router.delete("/food-label/:foodLabelId", validate(foodLabelIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, deleteFoodLabel);

//                                 USER
//vrati uzivatele podle id
router.get("/users/:id", authenticateToken, authorizeAdmin, getUserById);   

//vrati vsechny uzivatele
router.get("/users", authenticateToken, authorizeAdminWithoutUserId, getAllUsersAdmin);   

//zmeni profile image
router.patch("/users/:id/profile-image", authenticateToken, authorizeAdmin, upload.single("file"), updateUserProfileImage);

//smaže profile image
router.delete("/users/:id/profile-image", authenticateToken, authorizeAdmin, deleteUserProfileImage);

//updatuje uzivatele
router.patch("/users/:id", validate(updateUserAdminSchema), authenticateToken, sanitize, authorizeAdmin, updateUser);

//smaze uzivatele
router.delete("/users/:id", validate(userIdAdminSchema), authenticateToken, authorizeAdmin, deleteUser);



export default router;