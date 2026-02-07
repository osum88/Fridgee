import Joi from "joi";

export const updateFoodLabelSchema = Joi.object({
  foodLabelId: Joi.number().integer().required(),
  title: Joi.string().max(40).optional(),
  description: Joi.string().allow("").max(100).optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
  amount: Joi.number().min(0).max(9999).precision(3).default(0).optional(),
  unit: Joi.string().allow("").valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "").optional(),
  price: Joi.number().min(0).precision(2).max(999999).default(0),
});
