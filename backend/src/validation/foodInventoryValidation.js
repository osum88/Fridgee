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
    role: Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER).optional(),
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

export const deleteSchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    newOwnerId: Joi.number().integer().positive().optional(),
});

export const deleteAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
    newOwnerId: Joi.number().integer().positive().optional(),
});

export const deleteOtherSchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    targetUserId: Joi.number().integer().positive().required(),
});

export const getInventoryUsersSchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    role: Joi.alternatives().try(
        Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER,),
        Joi.array().items(
            Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER,)
        )).optional(),
});

export const archiveInventorySchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
});

export const archiveInventoryAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
});

export const updateFoodInventorySchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    title: Joi.string().min(3).max(100).optional(), 
    label: Joi.string().max(150).allow(null, "").optional(),
}).or("title", "label");

export const changeSettingSchema = Joi.object({
    inventoryId: Joi.number().integer().positive().required(),
    settings: Joi.object({
        expiringFood: Joi.boolean().optional(),
        lowStock: Joi.boolean().optional(),
        inventoryUpdates: Joi.boolean().optional(),
    }).min(1).required(), 
});

export const changeSettingAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    inventoryId: Joi.number().integer().positive().required(),
    settings: Joi.object({
        expiringFood: Joi.boolean().optional(),
        lowStock: Joi.boolean().optional(),
        inventoryUpdates: Joi.boolean().optional(),
    }).min(1).required(), 
});