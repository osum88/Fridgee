import Joi from "joi";
import { InventoryRole } from "@prisma/client";

export const createFoodInventorySchema = Joi.object({
  title: Joi.string().min(3).max(50).required().label("inventoryTitle"),
  icon: Joi.string().max(50).allow("").optional(),
});

export const createFoodInventoryAdminSchema = createFoodInventorySchema.keys({
  id: Joi.number().integer().positive().required(),
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

export const changeRoleAdminSchema = changeRoleSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const deleteSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  newOwnerId: Joi.number().integer().positive().optional(),
});

export const deleteAdminSchema = deleteSchema.keys({
  id: Joi.number().integer().positive().required(),
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

export const gellAllUsersSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  sortBy: Joi.string().max(20).allow("").optional(),
});

export const inventoryIdAdminSchema = inventoryIdSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const updateFoodInventorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  title: Joi.string().min(3).max(50).optional().label("inventoryTitle"),
  icon: Joi.string().max(50).allow("").optional(),
});

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

export const changeSettingAdminSchema = changeSettingSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const searchInventoryLabelSchema = Joi.object({
  inventoryId: Joi.alternatives()
    .try(Joi.number().integer().positive(), Joi.string().valid("null"))
    .required(),
  title: Joi.string().max(100).allow("").optional(),
  limit: Joi.number().integer().min(0).max(30).default(10).optional(),
});

export const searchInventoryLabelAdminSchema = searchInventoryLabelSchema.keys({
  id: Joi.number().integer().positive().required(),
  limit: Joi.number().min(0).default(10).optional(),
});

export const getHistorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  limit: Joi.number().integer().min(1).max(100).default(40),
  cursor: Joi.number().integer().min(1).optional(),
  type: Joi.alternatives()
    .try(
      Joi.array()
        .items(
          Joi.string().valid(
            "ADD",
            "CONSUME",
            "CONSUME_PARTIAL",
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
            "USER_JOINED",
            "MEMBER_LEFT",
            "ROLE_CHANGE",
            "MEMBER_REMOVED",
          ),
        )
        .single(),
      Joi.string().valid(""),
    )
    .optional(),
  fromDate: Joi.date().iso().optional(),
  toDate: Joi.date().iso().optional(),
  search: Joi.string().allow("").max(100).optional(),
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

export const foodIdInventoryIdSchema = Joi.object({
  foodId: Joi.number().integer().positive().required(),
  inventoryId: Joi.number().integer().positive().required(),
});

export const foodCatalogIdInventoryIdSchema = Joi.object({
  foodCatalogId: Joi.number().integer().positive().required(),
  inventoryId: Joi.number().integer().positive().required(),
});

export const searchUsersForInventorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  username: Joi.string().min(1).max(30).required(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

//                      SHOPPING LIST

export const createShoppingListSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  title: Joi.string().max(50).required().label("shoppingListTitle"),
});

export const updateShoppingListSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
  title: Joi.string().max(50).optional().label("shoppingListTitle"),
});

export const getShoppingListByIdSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
});

//                      SHOPPING LIST ITEM

export const createShoppingListItemSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
  foodId: Joi.number().integer().positive().optional(),
  itemId: Joi.number().integer().positive().optional(),
  catalogId: Joi.number().integer().positive().optional(),
  customTitle: Joi.string()
    .max(100)
    .label("labelTitle")
    .when("foodId", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.when("itemId", {
        is: Joi.exist(),
        then: Joi.optional(),
        otherwise: Joi.when("catalogId", {
          is: Joi.exist(),
          then: Joi.optional(),
          otherwise: Joi.required(),
        }),
      }),
    }),
  customDescription: Joi.string().allow("").max(250).optional().label("description"),
  customVariantTitle: Joi.string().allow("").max(40).optional().label("variant"),
  customBarcode: Joi.string().allow("").max(150).optional().label("barcode"),
  quantity: Joi.number().integer().min(1).max(99).default(1),
  amount: Joi.number().min(0).max(9999).precision(3).default(0).optional(),
  unit: Joi.string()
    .allow("")
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "MULTIPACK", "")
    .optional(),
  estimatedPrice: Joi.number().min(0).precision(2).max(999999).default(0),
  currency: Joi.string().length(3).uppercase().valid("CZK", "EUR").optional(),
});

export const updateShoppingListItemSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
  itemId: Joi.number().integer().positive().optional(),
  customTitle: Joi.string().max(100).label("labelTitle").optional(),
  customDescription: Joi.string().allow("").max(250).optional().label("description"),
  customVariantTitle: Joi.string().allow("").max(40).optional().label("variant"),
  customBarcode: Joi.string().allow("").max(150).optional().label("barcode"),
  quantity: Joi.number().integer().min(1).max(99).default(1),
  amount: Joi.number().min(0).max(9999).precision(3).optional(),
  unit: Joi.string()
    .allow("")
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "MULTIPACK", "")
    .optional(),
  estimatedPrice: Joi.number().min(0).precision(2).max(999999),
  currency: Joi.string().length(3).uppercase().valid("CZK", "EUR").optional(),

  isChecked: Joi.boolean().optional(),
});

export const deleteShoppingListItemSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
  itemId: Joi.number().integer().positive().required(),
  quantityToRemove: Joi.number().integer().positive().optional(),
});

export const getShoppingListItemSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
  shoppingListId: Joi.number().integer().positive().required(),
  itemId: Joi.number().integer().positive().required(),
});