import Joi from "joi";

//validace pro parametry obsahujici variantId
export const foodVariantIdSchema = Joi.object({
  variantId: Joi.number().integer().positive().required(),
});
