import Joi from "joi";

export const consumeFoodInstanceSchema = Joi.object({
  foodInstanceId: Joi.number().integer().required(),
  amountToConsume: Joi.number().min(0).max(9999).precision(3).default(0).optional(),
});
