import Joi from "joi";

export const addFoodToInventoryFoodSchema = Joi.object({
  inventoryId: Joi.number().integer().required(),
  barcode: Joi.string().allow("").max(150),
  variantId: Joi.number().integer().allow(null).optional(),
  variantTitle: Joi.string().trim().max(40).allow("").optional(),
  title: Joi.string().max(40).optional(),
  description: Joi.string().allow("").max(100).optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
  minimalQuantity: Joi.number().min(0).default(0),
  amount: Joi.number().positive().optional(),
  unit: Joi.string()
    .allow("")
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "")
    .optional(),
  quantity: Joi.number().integer().min(1).max(99).default(1),
  price: Joi.number().min(0).default(0),
  currency: Joi.string().length(3).uppercase().valid("CZK", "EUR").optional(),
  catalogId: Joi.number().integer().positive().allow(null).optional(),
  categoryId: Joi.number().integer().positive().allow(null).optional(),
}).or("catalogId", "barcode");

export const addFoodToInventoryFoodAdminSchema = addFoodToInventoryFoodSchema.keys({
  id: Joi.number().integer().positive().required(),
});
