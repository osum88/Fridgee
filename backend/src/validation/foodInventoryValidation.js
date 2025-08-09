import Joi from "joi";
import { InventoryRole } from "@prisma/client";

export const createFoodInventorySchema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    label: Joi.string().max(150).allow(null, "").optional(),
});

export const createFoodInventoryAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    title: Joi.string().min(3).max(100).required(),
    label: Joi.string().max(150).allow(null, "").optional(),
});

export const createInventoryUserAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
    targetUserId: Joi.number().integer().positive().required(),
    role: Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER).required(),
});

export const changeRoleSchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    targetUserId: Joi.number().integer().positive().required(),
    newRole: Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER).required(),
});

export const changeRoleAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
    targetUserId: Joi.number().integer().positive().required(),
    newRole: Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER).required(),
});

export const inventoryIdSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
});

export const deleteOtherSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  targetUserId: Joi.number().integer().positive().required(),
});

export const deleteOtherAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
    targetUserId: Joi.number().integer().positive().required(),
});