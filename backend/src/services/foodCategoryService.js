import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import {
  createFoodCategoryWithHistoryRepository,
  deleteFoodCategoryWithHistoryRepository,
  getFoodCategoriesByInventoryRepository,
  getFoodCategoryByIdRepository,
  getFoodCategoryByTitleRepository,
  updateFoodCategoryWithHistoryRepository,
} from "../repositories/foodCategoryRepository.js";
import { isExclusiveContributorRepository } from "../repositories/foodInstanceRepository.js";
import {
  getFoodInventoryRepository,
  getFoodInventoryUserRepository,
} from "../repositories/foodInventoryRepository.js";
import { getCategoryAndFoodByIdRepository } from "../repositories/foodRepository.js";
import { determineUpdateValue, formatTitleCase } from "../utils/stringUtils.js";

// vytvorti novou kategorii food
export const createFoodCategoryService = async (userId, inventoryId, title, isAdmin) => {
  await getFoodInventoryRepository(inventoryId);
  const titleIsExisting = await getFoodCategoryByTitleRepository(inventoryId, title);
  if (titleIsExisting) {
    throw new BadRequestError("Category title already exists in this inventory.");
  }
  if (!isAdmin) {
    const user = await getFoodInventoryUserRepository(userId, inventoryId);
    if (user.role !== "OWNER" && user.role !== "EDITOR") {
      throw new BadRequestError("Only OWNER or EDITOR can create category.");
    }
  }
  return await createFoodCategoryWithHistoryRepository(inventoryId, formatTitleCase(title), userId);
};

// vrati kategorii podle id
export const getFoodCategoryByIdService = async (id) => {
  const category = await getFoodCategoryByIdRepository(id);
  if (!category) {
    throw new NotFoundError(`Food category not found.`);
  }
  return category;
};

// vrati vsechny kategorie z konkretniho inventare
export const getFoodCategoriesByInventoryService = async (inventoryId, userId, isAdmin) => {
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }
  await getFoodInventoryRepository(inventoryId);
  return await getFoodCategoriesByInventoryRepository(inventoryId);
};

// updatuje kategorii podle id
export const updateFoodCategoryService = async (userId, categoryId, title, isAdmin) => {
  const category = await getFoodCategoryByIdRepository(categoryId);
  if (!isAdmin) {
    const user = await getFoodInventoryUserRepository(userId, category.inventoryId);
    if (user.role !== "OWNER" && user.role !== "EDITOR") {
      throw new BadRequestError("Only OWNER or EDITOR can change category.");
    }
  }

  if (category?.title.toLowerCase() === title.toLowerCase()) {
    return null;
  }

  const titleIsExisting = await getFoodCategoryByTitleRepository(category.inventoryId, title);
  if (titleIsExisting && titleIsExisting.id !== categoryId) {
    throw new BadRequestError("Category title already exists in this inventory.");
  }

  return await updateFoodCategoryWithHistoryRepository(categoryId, formatTitleCase(title), userId);
};

// smaze kategorii podle id
export const deleteFoodCategoryService = async (userId, categoryId, isAdmin) => {
  const category = await getFoodCategoryByIdRepository(categoryId);
  if (!isAdmin) {
    const user = await getFoodInventoryUserRepository(userId, category.inventoryId);
    if (user.role !== "OWNER") {
      throw new BadRequestError("Only OWNER can delete category.");
    }
  }
  return await deleteFoodCategoryWithHistoryRepository(categoryId, userId);
};

//zpracuje a zvaliduje zmeny kategorii a vrati data pro update nebo null
export const resolveCategoryUpdateData = async (
  categoryId,
  categoryTitle,
  foodId,
  userId,
  isAdmin,
  inventoryUser,
  inventoryId,
) => {
  if (categoryId === undefined && categoryTitle === undefined) {
    return null;
  }
  // ziska aktualni kategorii a tu kterou uzivatel pozaduje
  const [currentData, requestedCategory] = await Promise.all([
    getCategoryAndFoodByIdRepository(foodId, false),
    categoryId && categoryId !== null
      ? getFoodCategoryByIdRepository(parseInt(categoryId), false)
      : null,
  ]);

  const currentCategory = currentData?.category;
  let inputCategoryId = requestedCategory?.id
    ? parseInt(requestedCategory?.id)
    : requestedCategory?.id;

  // Logika pro smazání kategorie (pokud je povolen null)
  if (inputCategoryId === undefined) {
    if (categoryId === null || categoryTitle === null || categoryTitle === "") {
      if (currentCategory) {
        inputCategoryId = null;
      }
    }
  }

  let inputCategoryTitle = undefined;
  if (inputCategoryId === undefined && categoryTitle !== undefined) {
    inputCategoryTitle = formatTitleCase(categoryTitle);
  }

  const newId = determineUpdateValue(currentCategory?.id, inputCategoryId);
  const newTitle = determineUpdateValue(currentCategory?.title, inputCategoryTitle);

  if (newId === undefined && newTitle === undefined) {
    return null;
  }

  if (newId && requestedCategory?.inventoryId !== inventoryId) {
    throw new ForbiddenError("The requested category does not belong to this inventory.");
  }

  //kontrola co se ma stat
  const isCreatingNewCategory = !!newTitle;

  const isMovingOrRemoving = newId !== undefined;

  if (
    isCreatingNewCategory &&
    !isAdmin &&
    inventoryUser?.role !== "OWNER" &&
    inventoryUser?.role !== "EDITOR"
  ) {
    throw new ForbiddenError("Only OWNER or EDITOR can create new categories.");
  }

  //zjisti zda uzivatel je jedinym kdo ma insatnci daneho jidla
  // (vyjimka pro pravomoc odebrani nebo presununi do jiny kategorie)
  if (isMovingOrRemoving) {
    const isManager = isAdmin || ["OWNER", "EDITOR"].includes(inventoryUser?.role);
    const isExclusiveOwner = isManager
      ? false
      : await isExclusiveContributorRepository(foodId, userId);

    if (!isManager && !isExclusiveOwner) {
      throw new ForbiddenError("You do not have permission to modify the category of this food.");
    }
  }

  if (newId !== undefined || newTitle !== undefined) {
    return {
      new: {
        categoryId: newId,
        categoryTitle: formatTitleCase(newTitle),
      },
      old: {
        categoryId: currentCategory?.id || null,
        categoryTitle: currentCategory?.title || null,
      },
    };
  }

  return null;
};
