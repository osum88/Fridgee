import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import {
  createFoodLabelRepository,
  deleteFoodLabelRepository,
  getFoodLabelByIdRepository,
  getFoodLabelByUserIdCatalogIdRepository,
  updateFoodLabelWithHistoryRepository,
} from "../repositories/foodLabelRepository.js";
import { determineUpdateValue, isAnyValueDefined } from "../utils/stringUtils.js";

//vraci food label podle id
export const getFoodLabelByIdService = async (foodCatalogId, ownerId, userId, isAdmin) => {
  const userLabel = !isAdmin
    ? await getFoodLabelByUserIdCatalogIdRepository(userId, foodCatalogId)
    : null;

  const originalLabel = await getFoodLabelByUserIdCatalogIdRepository(ownerId, foodCatalogId);

  return mergeLabels(userLabel, originalLabel);
};

//pokud existuje pouzije se uzivatelsky popisek jinak se pouziva puvodni
//description lze explicitne smazat ostatni se jen prepisuji
const mergeLabels = (userLabel, originalLabel) => {
  return {
    title: userLabel?.title || originalLabel?.title || null,
    description: userLabel?.description ?? originalLabel?.description ?? null,
    foodImageUrl: userLabel?.foodImageUrl || originalLabel?.foodImageUrl || null,
    price: userLabel?.price ?? originalLabel?.price ?? 0,
    unit: userLabel?.unit ?? originalLabel?.unit ?? null,
    amount: userLabel?.amount ?? originalLabel?.amount ?? 0,
  };
};

// Zpracuje a zvaliduje zmeny food labelu
export const resolveFoodLabelUpdateData = async (userId, catalogId, data) => {
  if (
    data?.labelTitle === undefined &&
    data?.description === undefined &&
    data?.foodImageUrl === undefined
  ) {
    return null;
  }

  // aktualni label
  const userLabel = await getFoodLabelByUserIdCatalogIdRepository(userId, catalogId);

  const currentTitle = userLabel?.title ?? null;
  const currentDescription = userLabel?.description ?? null;
  const currentFoodImageUrl = userLabel?.foodImageUrl ?? null;

  // nove hodnoty
  const newTitle = determineUpdateValue(currentTitle, data?.labelTitle);
  const newDescription = determineUpdateValue(currentDescription, data?.description);
  const newFoodImageUrl = determineUpdateValue(currentFoodImageUrl, data?.foodImageUrl);

  // pokud se nic nemeni vracime null
  if (newTitle === undefined && newDescription === undefined && newFoodImageUrl === undefined) {
    return null;
  }

  return {
    id: userLabel?.id || null,
    new: {
      title: newTitle,
      description: newDescription,
      foodImageUrl: newFoodImageUrl,
    },
    old: {
      title: currentTitle,
    },
  };
};

// updatuje uzivateluv label
export const updateFoodLabelService = async (userId, data, isAdmin) => {
  const { foodLabelId, ...updateData } = data;

  if (!isAnyValueDefined(updateData)) {
    console.log("No fields provided for update.");
    return false;
  }

  const getCopyValue = (provided, original) => {
    if (provided === undefined) return original;
    if (provided === "") return null;
    return provided;
  };

  let foodLabel = await getFoodLabelByIdRepository(foodLabelId);
  console.log(foodLabel);

  //pokud se nejedna o useruv label pak chce vytvorit svoji upravenou kopii
  if (!isAdmin && foodLabel.userId !== userId) {
    const userFoodLabel = await getFoodLabelByUserIdCatalogIdRepository(
      userId,
      foodLabel.catalogId,
    );

    if (userFoodLabel) {
      foodLabel = userFoodLabel;
    } else {
      const payload = {
        userId: userId,
        catalogId: foodLabel.catalogId,
        title: getCopyValue(data?.title, foodLabel.title),
        description: getCopyValue(data?.description, foodLabel.description),
        foodImageUrl: getCopyValue(data?.foodImageUrl, foodLabel.foodImageUrl),
        price: getCopyValue(data?.price, foodLabel.price) ?? 0,
        unit: getCopyValue(data?.unit, foodLabel.unit),
        amount: getCopyValue(data?.amount, foodLabel.amount) ?? 0,
      };
      return await createFoodLabelRepository(payload);
    }
  }

  const updateLabelData = {
    new: {
      title: determineUpdateValue(foodLabel?.title, data?.title),
      description: determineUpdateValue(foodLabel?.description, data?.description),
      foodImageUrl: determineUpdateValue(foodLabel?.foodImageUrl, data?.foodImageUrl),
      price: determineUpdateValue(foodLabel?.price, data?.price, true),
      unit: determineUpdateValue(foodLabel?.unit, data?.unit),
      amount: determineUpdateValue(foodLabel?.amount, data?.amount, true),
    },
    old: {
      title: foodLabel.title,
    },
  };

  if (!isAnyValueDefined(updateLabelData.new)) {
    console.log("Data provided are identical to current database state.");
    return false;
  }
  return await updateFoodLabelWithHistoryRepository(foodLabel.id, updateLabelData, userId);
};

// smaze label (SOFT/HARD delete) a pokud je catalog bez barkodu tak ten taky (SOFT/HARD delete)
export const deleteFoodLabelService = async (labelId, userId, isAdmin) => {
  const foodLabel = await getFoodLabelByIdRepository(labelId, true);
  if (!isAdmin && foodLabel.userId !== userId) {
    throw new ForbiddenError("You do not have permission to delete this label.");
  }
  return await deleteFoodLabelRepository(labelId, userId, isAdmin);
};
