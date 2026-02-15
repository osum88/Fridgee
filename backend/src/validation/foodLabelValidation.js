import Joi from "joi";

export const updateFoodLabelSchema = Joi.object({
  foodLabelId: Joi.number().integer().required(),
  title: Joi.string().max(40).optional(),
  description: Joi.string().allow("").max(100).optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
  foodImageCloudId: Joi.number().integer().optional(),
  amount: Joi.number().min(0).max(9999).precision(3).optional(),
  unit: Joi.string().allow("").valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "").optional(),
  price: Joi.number().min(0).precision(2).max(999999),
});

export const foodLabelIdSchema = Joi.object({
  foodLabelId: Joi.number().integer().required(),
});

export const availableFoodLabelsSchema = Joi.object({
  page: Joi.number().min(1).integer().default(1).optional(),
  limit: Joi.number().min(1).integer().max(500).default(100).optional(),
});