import Joi from "joi";
import { InventoryRole } from "@prisma/client";

export const invitationIdSchema = Joi.object({
  invitationId: Joi.number().integer().positive().required(),
});

export const sendInvitationSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  receiverId: Joi.number().integer().positive().required(),
});
