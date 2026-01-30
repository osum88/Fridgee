import Joi from "joi";

//validace pri vytvoreni varianty
export const createFoodVariantSchema = Joi.object({
  title: Joi.string().max(40).required(),
  foodCatalogId: Joi.number().integer().positive().required(),
});

//validace pro admin vytvoreni varianty
export const createFoodVariantSchemaAdmin = createFoodVariantSchema.keys({
  id: Joi.number().integer().positive().required(),
});

//validace pri update varianty
export const updateFoodVariantSchema = Joi.object({
  title: Joi.string().max(40).required(),
  variantId: Joi.number().integer().positive().required(),
});

//validace pro parametry obsahujici variantId
export const foodVariantIdSchema = Joi.object({
  variantId: Joi.number().integer().positive().required(),
});