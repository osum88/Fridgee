import Joi from "joi";
import { InventoryRole } from "@prisma/client";

export const invitationIdSchema = Joi.object({
    invitationId: Joi.number().integer().positive().required(),
});

export const sendInvitationSchema = Joi.object({
    receiverId: Joi.number().integer().positive().required(),
    role: Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR).default(InventoryRole.USER),
});