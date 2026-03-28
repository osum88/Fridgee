import express from "express";
import validate from "../middlewares/validator.js";
import multer from "multer";
import { authenticateToken, authorizeAdmin, authorizeAdminWithoutUserId } from "../middlewares/authMiddleware.js";
import { acceptFriend, addFriend, cancelRequestFriend, deleteFriend, getAllFriends, getReceivedFriendRequests, getSentFriendRequests } from "../controllers/friendController.js";
import { createUser, deleteUser, deleteUserProfileImage, getAllUsersAdmin, getUserById, updateUser, updateUserProfileImage } from "../controllers/userController.js";
import { createUserSchema, updateUserAdminSchema, userIdAdminSchema } from "../validation/userValidation.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, leaveInventory, getAllFoodInventory, getInventoryContent, getInventoryDetailsWithUser, getUsersByInventoryId, getUsersByInventoryIdByRole, searchUsersForInventory, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { inventoryIdAdminSchema, changeRoleAdminSchema, changeSettingAdminSchema, createFoodInventoryAdminSchema, createInventoryUserAdminSchema, deleteAdminSchema, getInventoryUsersSchema, updateFoodInventorySchema, inventoryIdSchema, searchInventoryLabelAdminSchema, getHistorySchema, inventoryIdBarcodeSchema, foodCatalogIdInventoryIdSchema, searchUsersForInventorySchema, gellAllUsersSchema, changeRoleSchema, createShoppingListSchema, updateShoppingListSchema, getShoppingListByIdSchema, createShoppingListItemSchema, updateShoppingListItemSchema, deleteShoppingListItemSchema, getShoppingListItemSchema, deleteShoppingListSchema } from "../validation/foodInventoryValidation.js";
import { getFriendsAdminSchema } from "../validation/friendValidation.js";
import { sanitize } from "../middlewares/sanitize.js";
import { foodCatalogIdSchema, foodCatalogWithLabelByBarcodeSchema,  } from "../validation/foodCatalogValidation.js";
import { getFoodCatalogWithLabelByBarcode } from "../controllers/foodCatalogController.js";
import { categoryIdSchema, createFoodCategorySchema, updateFoodCategorySchema } from "../validation/foodCategoryValidation.js";
import { createFoodCategory, deleteFoodCategory, getFoodCategoriesByInventory, getFoodCategoryById, updateFoodCategory } from "../controllers/foodCategoryController.js";
import { getActiveFoodVariants, getAllFoodVariantsCatalog } from "../controllers/foodVariantController.js";
import { addFoodInstance, addFoodToInventory,  getFoodByBarcode,  updateFood } from "../controllers/foodController.js";
import { addFoodToInventoryFoodSchema, updateFoodSchema } from "../validation/foodValidation.js";
import { consumeMultipleFoodInstances, deleteFoodInstances, duplicateFoodInstances, updateFoodInstance } from "../controllers/foodInstanceController.js";
import { addFoodInstanceSchema, consumeFoodInstanceSchema, deleteFoodInstancesSchema, duplicateInstancesSchema, updateFoodInstanceSchema } from "../validation/foodInstanceValidation.js";
import { deleteFoodLabel, getLabelSuggestions, updateFoodLabel } from "../controllers/foodLabelController.js";
import { foodLabelIdSchema, updateFoodLabelSchema } from "../validation/foodLabelValidation.js";
import { getHistory } from "../controllers/foodHistoryController.js";
import { createShoppingList, deleteShoppingList, getShoppingListById, getShoppingLists, getShoppingListsContent, updateShoppingList } from "../controllers/shoppingListController.js";
import { createShoppingListItem, deleteShoppingListItem, getShoppingListItem, updateShoppingListItem } from "../controllers/shoppingListItemController.js";


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
router.post("/inventory/users/:id", validate(createFoodInventoryAdminSchema), authenticateToken, sanitize, authorizeAdmin, createFoodInventory);

//vytvori inventory user nastaveny jako USER
router.post("/inventory/:inventoryId/users/:id", validate(createInventoryUserAdminSchema),  authenticateToken, sanitize, authorizeAdmin, createInventoryUser);

//zmena settings usera
router.patch("/inventory/:inventoryId/users/:id/settings", validate(changeSettingAdminSchema), authenticateToken, sanitize, authorizeAdmin, changeSettingFoodInventoryUser);

//meni roli user v inventari
router.patch("/inventory/:inventoryId/users/:targetUserId", validate(changeRoleSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, changeRoleInventoryUser);

//smaze uzivatele z inventare
router.delete("/inventory/:inventoryId/users/:id", validate(deleteAdminSchema), authenticateToken, authorizeAdmin, leaveInventory);

//vrati vsechny uzivatele 
router.get("/inventory/:inventoryId/users/all", validate(gellAllUsersSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getUsersByInventoryId);

//vrati uzivatele podle role
router.get("/inventory/:inventoryId/users", validate(getInventoryUsersSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getUsersByInventoryIdByRole);

//vyhleda usery pro pridani do inventare
router.get("/inventory/:inventoryId/search-users", validate(searchUsersForInventorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, searchUsersForInventory);

//archivuje inventar
router.patch("/inventory/:inventoryId/archive", validate(inventoryIdSchema), authenticateToken, authorizeAdminWithoutUserId, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/inventory/:inventoryId/unarchive", validate(inventoryIdSchema), authenticateToken, authorizeAdminWithoutUserId, unarchiveFoodInventory);

//zmena title a label
router.patch("/inventory/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, updateFoodInventory);

// vrati vsechny kategorie z inventare
router.get("/inventory/:inventoryId/food-category", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getFoodCategoriesByInventory);

// vrati vsechny jidla s kategoriemi, instancemi a labely
router.get("/inventory/:inventoryId/content", validate(inventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getInventoryContent);

//vrati vsechny varianty v invenatri pro dane food
router.get("/inventory/:inventoryId/catalog/:foodCatalogId", validate(foodCatalogIdInventoryIdSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getActiveFoodVariants);

// vrati vsechny instance food podle barcodu
router.get("/inventory/:inventoryId/barcode/:barcode", validate(inventoryIdBarcodeSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getFoodByBarcode);

//ziska detail inventare s opravnenim 
router.get("/inventory/:inventoryId/users/:id", validate(inventoryIdAdminSchema), authenticateToken, sanitize, authorizeAdmin, getInventoryDetailsWithUser);

//vrati vsechny inventare uzivatele
router.get("/users/:id/inventory", authenticateToken, authorizeAdmin, getAllFoodInventory);

//hleda jidlo podle stringu
router.get("/users/:id/inventory/:inventoryId/suggestions", validate(searchInventoryLabelAdminSchema), authenticateToken, sanitize, authorizeAdmin, getLabelSuggestions);
// /api/admin/users/78/inventory/19/suggestions?title=apple&limit=5

//vraci historii
router.get("/inventory/:inventoryId/history", validate(getHistorySchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, getHistory);
// api/admin/inventory/19/history?limit=20&cursor=64&type=ADD

//                         FOOD SHOPPING LIST

//vytvori nakupni seznam
router.post("/inventory/:inventoryId/shopping-lists", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(createShoppingListSchema), createShoppingList);

//updatuje nakupni seznam
router.patch("/inventory/:inventoryId/shopping-lists/:shoppingListId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(updateShoppingListSchema), updateShoppingList);

//vraci vsechny nakupni seznam 
router.get("/inventory/:inventoryId/shopping-lists/list", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(inventoryIdSchema), getShoppingLists);

//vraci nakupni seznam
router.get("/inventory/:inventoryId/shopping-lists/:shoppingListId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(getShoppingListByIdSchema), getShoppingListById);

//vraci vsechny nakupni seznam
router.get("/inventory/:inventoryId/shopping-lists", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(inventoryIdSchema), getShoppingListsContent);

//smaze nakupni seznam
router.delete("/inventory/:inventoryId/shopping-lists/:shoppingListId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(deleteShoppingListSchema), deleteShoppingList);


//                      FOOD SHOPPING ITEMS

//vytvori item v nakupnim seznamu
router.post("/inventory/:inventoryId/shopping-lists/:shoppingListId/items", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(createShoppingListItemSchema), createShoppingListItem);

//upravi item v nakupnim seznamu
router.patch("/inventory/:inventoryId/shopping-lists/:shoppingListId/items/:itemId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(updateShoppingListItemSchema), updateShoppingListItem);

//smaze item v nakupnim seznamu
router.delete("/inventory/:inventoryId/shopping-lists/:shoppingListId/items/:itemId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(deleteShoppingListItemSchema), deleteShoppingListItem);

//vraci item v nakupnim seznamu
router.get("/inventory/:inventoryId/shopping-lists/:shoppingListId/items/:itemId", authenticateToken, authorizeAdminWithoutUserId, sanitize, validate(getShoppingListItemSchema), getShoppingListItem);

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
router.post("/food", authenticateToken, authorizeAdminWithoutUserId, sanitize, upload.single("file"), validate(addFoodToInventoryFoodSchema), addFoodToInventory);

// updatuje food, categorii a label food
router.patch("/", authenticateToken, authorizeAdminWithoutUserId, sanitize, upload.single("file"), validate(updateFoodSchema), updateFood);

//                          FOOD INSTANCE

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
router.patch("/food-instance/consume", validate(consumeFoodInstanceSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, consumeMultipleFoodInstances);

//updatuje jednu nebo vice stejnych instanci
router.patch("/food-instance", validate(updateFoodInstanceSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId , updateFoodInstance);

//duplikuje instance food
router.post("/food-instance/duplicate", validate(duplicateInstancesSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, duplicateFoodInstances);

//smaze jednu nebo vice instanci
router.delete("/food-instance", validate(deleteFoodInstancesSchema), authenticateToken, sanitize, authorizeAdminWithoutUserId, deleteFoodInstances);

// prida instanci food
router.post("/food-instance", validate(addFoodInstanceSchema),  authenticateToken, sanitize, authorizeAdminWithoutUserId, addFoodInstance);

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

//vytvoreni uzivatele
router.post("/users", validate(createUserSchema), sanitize, authorizeAdminWithoutUserId, createUser);


export default router;