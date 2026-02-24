import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, deleteOtherFoodInventoryUser, getAllFoodInventory, getInventoryContent, getInventoryDetailsWithUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { acceptInventoryInvitation, rejectInventoryInvitation, sendInventoryInvitation } from "../controllers/inventoryInvitationController.js";
import validate from "../middlewares/validator.js";
import { inventoryIdSchema, changeRoleSchema, changeSettingSchema, createFoodInventorySchema, deleteOtherSchema, deleteSchema, getInventoryUsersSchema, updateFoodInventorySchema, searchInventoryLabelSchema, getHistorySchema, inventoryIdBarcodeSchema } from "../validation/foodInventoryValidation.js";
import { invitationIdSchema, sendInvitationSchema } from "../validation/inventoryInvitationValidation.js";
import { sanitize } from "../middlewares/sanitize.js";
import { getFoodCategoriesByInventory } from "../controllers/foodCategoryController.js";
import { getLabelSuggestions } from "../controllers/foodLabelController.js";
import { getHistory } from "../controllers/foodHistoryController.js";
import { getFoodByBarcode } from "../controllers/foodController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeUser);
router.use(sanitize);

//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/", validate(createFoodInventorySchema), createFoodInventory);

//odesle pozvanku userovi
router.post("/:inventoryId/invitations", validate(sendInvitationSchema), sendInventoryInvitation);

//potvrdi pozvanku do inventare
router.post("/:invitationId/accept", validate(invitationIdSchema), acceptInventoryInvitation);

//odmitne pozvanku do inventare
router.post("/:invitationId/reject", validate(invitationIdSchema), rejectInventoryInvitation);

//zmena settings usera
router.patch("/:inventoryId/users/settings", validate(changeSettingSchema), changeSettingFoodInventoryUser);

//meni roli user v inventari
router.patch("/:inventoryId/users/:targetUserId", validate(changeRoleSchema), changeRoleInventoryUser);

//smaze jineho uzivatele z inventare
router.delete("/:inventoryId/users/:targetUserId", validate(deleteOtherSchema), deleteOtherFoodInventoryUser);

//smaze me z inventare
router.delete("/:inventoryId/users", validate(deleteSchema), deleteFoodInventoryUser);

//vrati uzivatele podle role
router.get("/:inventoryId/users", validate(getInventoryUsersSchema), getUsersByInventoryId);
//http://localhost:3001/api/inventory/3/users?role=OWNER&role=EDITOR

//archivuje inventar
router.patch("/:inventoryId/archive", validate(inventoryIdSchema), archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/:inventoryId/unarchive", validate(inventoryIdSchema), unarchiveFoodInventory);

//zmena title a label
router.patch("/:inventoryId", validate(updateFoodInventorySchema), updateFoodInventory);

// vrati vsechny kategorie z inventare
router.get("/:inventoryId/food-category", validate(inventoryIdSchema), getFoodCategoriesByInventory);

// vrati vsechny jidla s kategoriemi, intancemi a labely
router.get("/:inventoryId/content", validate(inventoryIdSchema), getInventoryContent);

// vrati vsechny instance food podle barcodu
router.get("/:inventoryId/barcode/:barcode", validate(inventoryIdBarcodeSchema), getFoodByBarcode);

//ziska detail inventare s opravnenim 
router.get("/:inventoryId", validate(inventoryIdSchema), getInventoryDetailsWithUser);

//vrati vsechny inventare uzivatele
router.get("/", getAllFoodInventory);

//hleda jidlo podle stringu
router.get("/:inventoryId/suggestions", validate(searchInventoryLabelSchema), getLabelSuggestions);
// /api/inventory/19/suggestions?title=apple&limit=5

//vraci historii
router.get("/:inventoryId/history", validate(getHistorySchema), getHistory);
// api/inventory/19/history?limit=40&cursor=64&type=ADD

export default router;

