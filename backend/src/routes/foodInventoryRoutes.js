import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { changeRoleInventoryUser, createFoodInventory, createInventoryUser, deleteFoodInventoryUser, deleteOtherFoodInventoryUser } from "../controllers/foodInventoryController.js";
import { acceptInventoryInvitation, rejectInventoryInvitation, sentInventoryInvitation } from "../controllers/inventoryInvitationController.js";
import validate from "../middlewares/validator.js";
import { changeRoleSchema, createFoodInventorySchema, deleteOtherSchema, inventoryIdSchema } from "../validation/foodInventoryValidation.js";
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

//smaze me z inventare
router.delete("/:inventoryId/users", validate(inventoryIdSchema), authenticateToken, authorizeUser, deleteFoodInventoryUser);

//smaze jineho uzivatele z inventare
router.delete("/:inventoryId/users/:targetUserId", validate(deleteOtherSchema), authenticateToken, authorizeUser, deleteOtherFoodInventoryUser);

export default router;

