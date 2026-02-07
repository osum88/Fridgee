import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";

import {
  
  deleteFoodCatalogRepository,
  getAllFoodCatalogsByUserRepository,
  getFoodCatalogByBarcodeRepository,
  getFoodCatalogByIdRepository,
  updateFoodCatalogRepository,
  
} from "../repositories/foodCatalogRepository.js";
import { getRelevantFoodVariantsRepository } from "../repositories/foodVariantRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";
import { cleanEmptyStrings } from "../utils/cleanEmptyStrings.js";
import { getFoodLabelByIdService, updateOrCreateFoodLabelService } from "./foodLabelService.js";



//vraci food catalog podle id
export const getFoodCatalogByIdService = async (foodCatalogId, userId, isAdmin) => {
  const catalog = await getFoodCatalogByIdRepository(foodCatalogId);

  const label = await getFoodLabelByIdService(foodCatalogId, catalog.addedBy, userId, isAdmin);

  const variants = await getRelevantFoodVariantsRepository(catalog.id, userId);

  return { ...catalog, ...label, variants };
};

//vraci vsechny catalogy usera
export const getAllFoodCatalogsByUserService = async (userId, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }
  const catalogs = await getAllFoodCatalogsByUserRepository(userId);
  return catalogs;
};

//smaze katalog podle id
export const deleteFoodCatalogService = async (foodCatalogId, userId, isAdmin) => {
  const catalog = await getFoodCatalogByIdRepository(foodCatalogId, false, null);

  if (!isAdmin && catalog?.addedBy !== userId) {
    throw new ForbiddenError("You are not allowed to delete this catalog.");
  }

  //@TODO
  //smaze label pokud neni nikde pouzivan

  //soft delete
  if (false) {
    await updateFoodCatalogRepository(foodCatalogId, { isDeleted: true });
  } else {
    //hard delete
    await deleteFoodCatalogRepository(foodCatalogId);
  }
  return true;
};

