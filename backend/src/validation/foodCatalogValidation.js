import Joi from "joi";

export const foodCatalogIdSchema = Joi.object({
  foodCatalogId: Joi.number().integer().positive().required(),
});

export const foodCatalogIdAdminSchema = foodCatalogIdSchema.keys({
  id: Joi.number().integer().positive().required(),
});

export const foodCatalogWithLabelByBarcodeSchema = Joi.object({
  barcode: Joi.string().allow("").max(150),
  inventoryId: Joi.alternatives()
    .try(
      Joi.number().integer().positive(), 
      Joi.string().valid("null")
    )
    .required(),
});
