import Joi from "joi";

export const categoryIdSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
});

export const createFoodCategorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required().strict(),
  title: Joi.string().max(50).required(),
});

export const updateFoodCategorySchema = Joi.object({
  inventoryId: Joi.number().integer().positive().optional(),
  title: Joi.string().max(50).required(),
  categoryId: Joi.number().integer().positive().required(),
});
