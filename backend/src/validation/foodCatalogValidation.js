import Joi from "joi";

export const foodCatalogIdSchema = Joi.object({
  foodCatalogId: Joi.number().integer().positive().required(),
});

export const foodCatalogIdAdminSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  foodCatalogId: Joi.number().integer().positive().required(),
});
