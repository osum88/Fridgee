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
  role: Joi.string()
    .valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER)
    .optional(),
});

export const changeRoleSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  targetUserId: Joi.number().integer().positive().required(),
  newRole: Joi.string()
    .valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER)
    .required(),
});

export const changeRoleAdminSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  inventoryId: Joi.number().integer().positive().required(),
  targetUserId: Joi.number().integer().positive().required(),
  newRole: Joi.string()
    .valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER)
    .required(),
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
  role: Joi.alternatives()
    .try(
      Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER),
      Joi.array().items(
        Joi.string().valid(InventoryRole.USER, InventoryRole.EDITOR, InventoryRole.OWNER),
      ),
    )
    .optional(),
});

export const inventoryIdSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
});

export const inventoryIdAdminSchema = Joi.object({
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
  })
    .min(1)
    .required(),
});

export const changeSettingAdminSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  inventoryId: Joi.number().integer().positive().required(),
  settings: Joi.object({
    expiringFood: Joi.boolean().optional(),
    lowStock: Joi.boolean().optional(),
    inventoryUpdates: Joi.boolean().optional(),
  })
    .min(1)
    .required(),
});

export const searchInventoryLabelSchema = Joi.object({
  inventoryId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().valid("null"))
    .required(),
  title: Joi.string().max(50).allow("").optional(),
  limit: Joi.number().integer().min(0).max(30).default(10).optional(),
});

export const searchInventoryLabelAdminSchema = searchInventoryLabelSchema.keys({
  id: Joi.number().integer().positive().required(),
  limit: Joi.number().min(0).default(10).optional(),
});

export const getHistorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().min(1).max(100).default(20),
  cursor: Joi.number().integer().min(1).optional(),
  type: Joi.alternatives()
    .try(
      Joi.array()
        .items(
          Joi.string().valid(
            "ADD",
            "CONSUME",
            "UPDATE",
            "EXPIRE",
            "REMOVE",
            "MERGE",
            "UPDATE_MERGE",
            "CATEGORY_MOVE",
            "LABEL_UPDATE",
            "MIN_QUANTITY_UPDATE",
            "CATEGORY_RENAME",
            "CATEGORY_CREATE",
            "CATEGORY_REMOVE",
          ),
        )
        .single(),
      Joi.string().valid(""),
    )
    .optional(),
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
  search: Joi.string().allow("").max(50).optional(),
  changedBy: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.array().items(Joi.number().integer().positive()).single(),
    )
    .optional(),
});

export const inventoryIdBarcodeSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  barcode: Joi.string().max(150).required(),
});
