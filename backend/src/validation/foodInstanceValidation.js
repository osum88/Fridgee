import Joi from "joi";

export const consumeFoodInstanceSchema = Joi.object({
  foodInstanceId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.array().items(Joi.number().integer().positive()).min(1),
    )
    .required(),
  amountToConsume: Joi.number().min(0).max(9999).precision(3).default(0).optional(),
});

export const updateFoodInstanceSchema = Joi.object({
  foodInstanceId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.array().items(Joi.number().integer().positive()).min(1),
    )
    .required(),
  amount: Joi.number().min(0).max(9999).precision(3).optional(),
  unit: Joi.string().allow("").valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "MULTIPACK", "").optional(),
  expirationDate: Joi.date().iso().allow("").optional(),
  price: Joi.number().min(0).precision(2).max(999999),
  currency: Joi.string().length(3).uppercase().valid("CZK", "EUR", "").optional(),
  variantId: Joi.number().integer().allow(null).optional(),
  variantTitle: Joi.string().trim().max(40).allow("").optional(),
});

export const duplicateInstancesSchema = Joi.object({
  count: Joi.number().integer().min(1).max(99).default(1),
  foodInstanceId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.array().items(Joi.number().integer().positive()).min(1),
    )
    .required(),
});

export const deleteFoodInstancesSchema = Joi.object({
  foodInstanceId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(),
      Joi.array().items(Joi.number().integer().positive()).min(1),
    )
    .required(),
});
