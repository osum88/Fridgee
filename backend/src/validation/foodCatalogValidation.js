import Joi from "joi";

//validace pri vytvoreni katalogu
export const createFoodCatalogSchema = Joi.object({
  barcode: Joi.string().allow("").max(150).optional(),
  title: Joi.string().max(40).required(),
  description: Joi.string().allow("").max(100).optional(),
  price: Joi.number().min(0).default(0).max(999999).optional(),
  unit: Joi.string().allow("")
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "")
    .optional(),
  amount: Joi.number().min(0).default(0).optional(),
  foodImageUrl: Joi.string().uri().optional(),
  variantTitle: Joi.string().max(40).allow("").optional(),
});

export const createFoodCatalogAdminSchema = createFoodCatalogSchema.keys({
  id: Joi.number().integer().positive().required(),
});

//validace vstupu pro aktualizaci food katalogu
export const updateFoodCatalogSchema = Joi.object({
  foodCatalogId: Joi.number().integer().positive().required(),
  barcode: Joi.string().max(150).allow("").optional(),
  title: Joi.string().max(40).allow("").optional(),
  description: Joi.string().allow("").max(100).optional(),
  price: Joi.number().min(0).max(999999).optional(),
  unit: Joi.string()
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L", "")
    .optional(),
  amount: Joi.number().min(0).max(9999).optional(),
  isGlobal: Joi.boolean().optional(),
  foodImageUrl: Joi.string().uri().allow("").optional(),
});



export const foodCatalogIdSchema = Joi.object({
  foodCatalogId: Joi.number().integer().positive().required(),
});

export const foodCatalogIdAdminSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
  foodCatalogId: Joi.number().integer().positive().required(),
});
