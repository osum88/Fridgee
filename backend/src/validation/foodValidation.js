import Joi from "joi";

export const addFoodToInventoryFoodSchema = Joi.object({
  inventoryId: Joi.number().integer().required(),
  barcode: Joi.string().allow("").max(150),
  variantId: Joi.number().integer().allow(null).optional(),
  variantTitle: Joi.string().trim().max(40).allow("").optional(),
  title: Joi.string().max(100).optional(),
  description: Joi.string().allow("").max(250).optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
  foodImageCloudId: Joi.number().integer().optional(),
  minimalQuantity: Joi.number().min(0).max(9999).default(0),
  amount: Joi.number().min(0).max(9999).precision(3).default(0).optional(),
  unit: Joi.string()
    .allow("")
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "MULTIPACK", "")
    .optional(),
  quantity: Joi.number().integer().min(1).max(99).default(1),
  price: Joi.number().min(0).precision(2).max(999999).default(0),
  currency: Joi.string().length(3).uppercase().valid("CZK", "EUR").optional(),
  catalogId: Joi.number().integer().positive().allow(null).optional(),
  categoryId: Joi.number().integer().positive().allow(null).optional(),
  expirationDate: Joi.date().iso().allow("").optional(),
}).or("catalogId", "barcode");

export const updateFoodSchema = Joi.object({
  foodId: Joi.number().integer().required(),
  categoryId: Joi.number().integer().positive().allow(null).optional(),
  categoryTitle: Joi.string().max(50).allow("").optional(),
  variantId: Joi.number().integer().positive().allow(null).optional(),
  variantTitle: Joi.string().max(40).allow("").optional(),
  labelTitle: Joi.string().max(100).optional(),
  description: Joi.string().allow("").max(250).optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
  foodImageCloudId: Joi.number().integer().optional(),
  minimalQuantity: Joi.number().min(0).max(9999),
});
