import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";

import {
  createFoodCatalogRepository,
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

//vytvari food catalog
export const createFoodCatalogService = async (data, userId, isAdmin) => {
  const { barcode, title, description, price, unit, amount, foodImageUrl, variantTitle } = data;

  if (isAdmin) {
    await getUserByIdRepository(userId);
  }

  //kontrola jestli uz uzivatel nema katalog s danym barcode, pokud je smazany, obnovi ho
  if (barcode) {
    const existingCatalog = await getFoodCatalogByBarcodeRepository(barcode, userId, null);

    if (existingCatalog?.isDeleted) {
      await updateFoodCatalogRepository(existingCatalog.id, {
        isDeleted: false,
      });
      const { variantTitle, barcode, ...rest } = data;
      return updateFoodCatalogService(existingCatalog?.id, userId, isAdmin, rest, null);
    } else if (existingCatalog) {
      throw new ConflictError("Food catalog with this barcode already exists.");
    }
  }

  const catalog = await createFoodCatalogRepository(
    userId,
    barcode,
    title,
    description,
    price,
    unit,
    amount,
    foodImageUrl,
    variantTitle,
  );
  if (!catalog) {
    throw new InternalServerError("Failed to create food catalog.");
  }

  const variants = await getRelevantFoodVariantsRepository(catalog.id, userId);

  return { ...catalog, variants };
};

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

// updatuje katalog podle id
export const updateFoodCatalogService = async (
  foodCatalogId,
  userId,
  isAdmin,
  updateData,
  isDeleted = false,
) => {
  const catalog = await getFoodCatalogByIdRepository(foodCatalogId, true, isDeleted);

  if (isAdmin) {
    await getUserByIdRepository(catalog?.addedBy);
  }

  const isOwnerOrAdmin = isAdmin || catalog?.addedBy === userId;

  if (isOwnerOrAdmin && updateData.title === "") {
    throw new BadRequestError("Title must exist.");
  }

  // vyfiltruje null/undefined
  const { title, description, barcode, ...filteredUpdateData } = Object.fromEntries(
    Object.entries(updateData).filter(([_, value]) => value != null),
  );

  //nahradi prazdne stringy null
  const finalData = cleanEmptyStrings(filteredUpdateData);

  //updatuje label pokud existuje, jinak ho vytvori
  const newLabel = await updateOrCreateFoodLabelService(
    foodCatalogId,
    userId,
    isOwnerOrAdmin,
    { title, description, ...finalData },
    catalog,
  );

  if (!isOwnerOrAdmin) {
    return newLabel;
  }

  if (barcode || barcode === "") {
    //kontrola jestli uz uzivatel nema katalog s danym barcode
    const existingCatalog = await getFoodCatalogByBarcodeRepository(barcode, catalog.addedBy);

    if (existingCatalog && existingCatalog.id !== foodCatalogId) {
      throw new ConflictError("Food catalog with this barcode already exists.");
    }

    const updatedCatalog = await updateFoodCatalogRepository(foodCatalogId, {
      barcode: barcode ? barcode : null,
    });

    return {
      ...updatedCatalog,
      title: newLabel?.title,
      description: newLabel?.description,
      foodImageUrl: newLabel?.foodImageUrl,
      price: newLabel?.price,
      unit: newLabel?.unit,
      amount: newLabel?.amount,
    };
  }
  return newLabel;
};
