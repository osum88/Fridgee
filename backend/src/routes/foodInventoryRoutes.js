import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { archiveFoodInventory, changeRoleInventoryUser, changeSettingFoodInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, deleteOtherFoodInventoryUser, getAllFoodInventory, getInventoryDetailsWithUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { acceptInventoryInvitation, rejectInventoryInvitation, sendInventoryInvitation } from "../controllers/inventoryInvitationController.js";
import validate from "../middlewares/validator.js";
import { inventoryIdSchema, changeRoleSchema, changeSettingSchema, createFoodInventorySchema, deleteOtherSchema, deleteSchema, getInventoryUsersSchema, updateFoodInventorySchema } from "../validation/foodInventoryValidation.js";
import { invitationIdSchema, sendInvitationSchema } from "../validation/inventoryInvitationValidation.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();

//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/", validate(createFoodInventorySchema), authenticateToken, sanitize, authorizeUser, createFoodInventory);

//odesle pozvanku userovi
router.post("/:inventoryId/invitations", validate(sendInvitationSchema), authenticateToken, sanitize, authorizeUser, sendInventoryInvitation);

//potvrdi pozvanku do inventare
router.post("/:invitationId/accept", validate(invitationIdSchema), authenticateToken,  authorizeUser, acceptInventoryInvitation);

//odmitne pozvanku do inventare
router.post("/:invitationId/reject", validate(invitationIdSchema), authenticateToken,  authorizeUser, rejectInventoryInvitation);

//zmena settings usera
router.patch("/:inventoryId/users/settings", validate(changeSettingSchema), authenticateToken, sanitize, authorizeUser, changeSettingFoodInventoryUser);

//meni roli user v inventari
router.patch("/:inventoryId/users/:targetUserId", validate(changeRoleSchema), authenticateToken, sanitize, authorizeUser, changeRoleInventoryUser);

//smaze jineho uzivatele z inventare
router.delete("/:inventoryId/users/:targetUserId", validate(deleteOtherSchema), authenticateToken,  authorizeUser, deleteOtherFoodInventoryUser);

//smaze me z inventare
router.delete("/:inventoryId/users", validate(deleteSchema), authenticateToken, authorizeUser, deleteFoodInventoryUser);

//vrati uzivatele podle role
router.get("/:inventoryId/users", validate(getInventoryUsersSchema), authenticateToken, sanitize, authorizeUser, getUsersByInventoryId);
//http://localhost:3001/api/inventory/3/users?role=OWNER&role=EDITOR

//archivuje inventar
router.patch("/:inventoryId/archive", validate(inventoryIdSchema), authenticateToken, authorizeUser, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/:inventoryId/unarchive", validate(inventoryIdSchema), authenticateToken, authorizeUser, unarchiveFoodInventory);

//zmena title a label
router.patch("/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, sanitize, authorizeUser, updateFoodInventory);

//vrati vsechny inventare uzivatele
router.get("/", authenticateToken, authorizeUser, getAllFoodInventory);

//ziska detail inventare s opravnenim 
router.get("/:inventoryId", validate(inventoryIdSchema), authenticateToken, authorizeUser, getInventoryDetailsWithUser);



export default router;

