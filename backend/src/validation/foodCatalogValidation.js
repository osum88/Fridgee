import Joi from "joi";

//validace pri vytvoreni katalogu
export const createFoodCatalogSchema = Joi.object({
  barcode: Joi.string().max(150).optional(),
  title: Joi.alternatives()
    .try(
      Joi.string().max(40),
      Joi.object({
        cs: Joi.string().max(40).optional(),
        en: Joi.string().max(40).optional(),
        unk: Joi.string().max(40).optional(),
      }).or("cs", "en", "unk")
    )
    .required(),
  description: Joi.alternatives()
    .try(
      Joi.string().max(100),
      Joi.object({
        cs: Joi.string().max(100).optional(),
        en: Joi.string().max(100).optional(),
        unk: Joi.string().max(100).optional(),
      }).or("cs", "en", "unk")
    )
    .optional(),
  price: Joi.number().min(0).default(0).optional(),
  unit: Joi.string()
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L")
    .optional(),
  amount: Joi.number().min(0).default(0).optional(),
  isGlobal: Joi.boolean().default(false).optional(),
  foodImageUrl: Joi.string().uri().optional(),
});

export const createFoodCatalogAdminSchema = createFoodCatalogSchema.keys({
  id: Joi.number().integer().positive().required(),
});

//validace vstupu pro aktualizaci food katalogu
export const updateFoodCatalogSchema = Joi.object({
  barcode: Joi.string().max(150).optional(),
  title: Joi.alternatives()
    .try(
      Joi.string().max(40),
      Joi.object({
        cs: Joi.string().max(40).optional(),
        en: Joi.string().max(40).optional(),
        unk: Joi.string().max(40).optional(),
      }).or("cs", "en", "unk")
    )
    .optional(),
  description: Joi.alternatives()
    .try(
      Joi.string().max(100),
      Joi.object({
        cs: Joi.string().max(100).optional(),
        en: Joi.string().max(100).optional(),
        unk: Joi.string().max(100).optional(),
      }).or("cs", "en", "unk")
    )
    .optional(),
  price: Joi.number().min(0).optional(),
  unit: Joi.string()
    .valid("MG", "G", "DG", "KG", "ML", "CL", "DL", "L")
    .optional(),
  amount: Joi.number().min(0).optional(),
  isGlobal: Joi.boolean().optional(),
  foodImageUrl: Joi.string().uri().optional(),
});

export const foodCatalogIdSchema = Joi.object({
  inventoryId: Joi.number().integer().positive().required(),
});
