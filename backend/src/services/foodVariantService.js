import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import {
  getFoodVariantByIdRepository,
  getAllFoodVariantsCatalogRepository,
} from "../repositories/foodVariantRepository.js";
import { getVariantByFoodIdRepository } from "../repositories/foodRepository.js";
import { determineUpdateValue, formatTitleCase } from "../utils/stringUtils.js";

// vraci food variant podle id
export const getFoodVariantByIdService = async (variantId) => {
  const variant = await getFoodVariantByIdRepository(variantId);
  const { id, title, ...rest } = variant;
  return { id, title };
};

// vraci vsechny varianty katalogu podle kontextu (admin vs user)
export const getAllFoodVariantsCatalogService = async (catalogId, isAdmin) => {
  if (isAdmin) {
    return await getAllFoodVariantsCatalogRepository(catalogId);
  }
};

//zpracuje a zvaliduje zmeny varianty potraviny.
export const resolveVariantUpdateData = async (
  variantId,
  variantTitle,
  foodId,
  userId,
  isAdmin,
  inventoryUser,
  allFood = false,
) => {
  if (variantId === undefined && variantTitle === undefined) {
    return null;
  }

  const [currentVariant, requestedVariant] = await Promise.all([
    getVariantByFoodIdRepository(foodId, false),
    variantId && variantId !== null
      ? getFoodVariantByIdRepository(parseInt(variantId), false)
      : null,
  ]);

  // validace opravneni
  const hasPermission =
    isAdmin ||
    (currentVariant && currentVariant.addedBy === userId && !allFood) ||
    ["OWNER", "EDITOR"].includes(inventoryUser?.role);

  if (!hasPermission) {
    throw new ForbiddenError("You do not have permission to modify the variant of this food.");
  }

  let inputVariantId = requestedVariant?.id;

  if (inputVariantId === undefined) {
    if (variantId === null || variantTitle === null || variantTitle === "") {
      if (currentVariant) {
        inputVariantId = null;
      }
    }
  }

  let inputVariantTitle = undefined;
  if (inputVariantId === undefined && variantTitle !== undefined) {
    inputVariantTitle = formatTitleCase(variantTitle);
  }

  const newId = determineUpdateValue(currentVariant?.id, inputVariantId);
  const newTitle = determineUpdateValue(currentVariant?.title, inputVariantTitle);

  // pokud se neco zmenilo vratime objekt jinak null
  if (newId !== undefined || newTitle !== undefined) {
    return {
      new: {
        variantId: newId,
        variantTitle: newTitle,
      },
      old: {
        variantId: currentVariant?.id || null,
        variantTitle: currentVariant?.title || null,
      },
    };
  }

  return null;
};
