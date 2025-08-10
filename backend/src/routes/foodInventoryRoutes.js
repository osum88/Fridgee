import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { archiveFoodInventory, changeRoleInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, deleteOtherFoodInventoryUser, getUsersByInventoryId, unarchiveFoodInventory, updateFoodInventory } from "../controllers/foodInventoryController.js";
import { acceptInventoryInvitation, rejectInventoryInvitation, sentInventoryInvitation } from "../controllers/inventoryInvitationController.js";
import validate from "../middlewares/validator.js";
import { archiveInventorySchema, changeRoleSchema, createFoodInventorySchema, deleteOtherSchema, deleteSchema, getInventoryUsersSchema, updateFoodInventorySchema } from "../validation/foodInventoryValidation.js";
import { invitationIdSchema, sendInvitationSchema } from "../validation/inventoryInvitationValidation.js";

const router = express.Router();

//vytvari inventar a inventory user nastaveny jako OWNER
router.post("/", validate(createFoodInventorySchema), authenticateToken, authorizeUser, createFoodInventory);

//odesle pozvanku userovi
router.post("/:inventoryId/invitations", validate(sendInvitationSchema), authenticateToken, authorizeUser, sentInventoryInvitation);

//potvrdi pozvanku do inventare
router.post("/:invitationId/accept", validate(invitationIdSchema), authenticateToken, authorizeUser, acceptInventoryInvitation);

//odmitne pozvanku do inventare
router.post("/:invitationId/reject", validate(invitationIdSchema), authenticateToken, authorizeUser, rejectInventoryInvitation);

//meni roli user v inventari
router.patch("/:inventoryId/users/:targetUserId", validate(changeRoleSchema), authenticateToken, authorizeUser, changeRoleInventoryUser);

//smaze jineho uzivatele z inventare
router.delete("/:inventoryId/users/:targetUserId", validate(deleteOtherSchema), authenticateToken, authorizeUser, deleteOtherFoodInventoryUser);

//smaze me z inventare
router.delete("/:inventoryId/users", validate(deleteSchema), authenticateToken, authorizeUser, deleteFoodInventoryUser);

//vrati uzivatele podle role
router.get("/:inventoryId/users", validate(getInventoryUsersSchema), authenticateToken, authorizeUser, getUsersByInventoryId);
//http://localhost:3001/api/inventory/3/users?role=OWNER?role=OWNER&role=EDITOR

//archivuje inventar
router.patch("/:inventoryId/archive", validate(archiveInventorySchema), authenticateToken, authorizeUser, archiveFoodInventory);

//zrusi archivaci inventare
router.patch("/:inventoryId/unarchive", validate(archiveInventorySchema), authenticateToken, authorizeUser, unarchiveFoodInventory);

//smena title a label
router.patch("/:inventoryId", validate(updateFoodInventorySchema), authenticateToken, authorizeUser, updateFoodInventory);

//vrati vsechny inventare uzivatele


export default router;

