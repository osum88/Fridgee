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
  getDefaultFoodLabelByUserLabelIdRepository,
  getFoodLabelByIdRepository,
  getFoodLabelByUserIdCatalogIdRepository,
  updateFoodLabelRepository,
} from "../repositories/foodLabelRepository.js";
import { determineUpdateValue, isAnyValueDefined } from "../utils/stringUtils.js";

//updatuje label pokud existuje jinak ho  vytvori
export const updateOrCreateFoodLabelService = async (
  foodCatalogId,
  userId,
  isOwnerOrAdmin,
  updateData,
  catalog,
) => {
  // najde label
  const targetUserId = isOwnerOrAdmin ? catalog.addedBy : userId;
  const label = await getFoodLabelByUserIdCatalogIdRepository(targetUserId, foodCatalogId);

  // payload (description ma explicitni "" kvuli moznosti uplneho smazani description)
  const payload = {
    title: updateData?.title ?? label?.title,
    description:
      isOwnerOrAdmin && updateData?.description === ""
        ? null
        : (updateData?.description ?? label?.description),
    foodImageUrl: updateData?.foodImageUrl,
    price: updateData?.price,
    unit: updateData?.unit,
    amount: updateData?.amount,
  };

  // update nebo create
  let newLabel;
  if (label) {
    newLabel = await updateFoodLabelRepository(label.id, payload);
  } else {
    newLabel = await createFoodLabelRepository({
      ...payload,
      userId: targetUserId,
      catalogId: foodCatalogId,
    });
  }

  const originalLabel = await getFoodLabelByUserIdCatalogIdRepository(
    catalog.addedBy,
    foodCatalogId,
  );

  return {
    ...catalog,
    ...mergeLabels(newLabel, originalLabel),
  };
};

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

export const updateFoodLabelService = async (userId, data, isAdmin) => {
  const { foodLabelId, ...updateData } = data;

  if (!isAnyValueDefined(updateData)) {
    console.log("No fields provided for update.");
    return false;
  }

  const foodLabel = await getFoodLabelByIdRepository(foodLabelId);
  if (!isAdmin && foodLabel.userId !== userId) {
    throw new ForbiddenError("You do not have permission to edit someone else's label.");
  }

  const newPrice = determineUpdateValue(foodLabel?.price, data?.price);
  const newAmount = determineUpdateValue(foodLabel?.amount, data?.amount);

  const newLabelData = {
    new: {
      title: determineUpdateValue(foodLabel?.title, data?.title),
      description: determineUpdateValue(foodLabel?.description, data?.description),
      foodImageUrl: determineUpdateValue(foodLabel?.foodImageUrl, data?.foodImageUrl),
      price: newPrice === null ? 0 : newPrice,
      unit: determineUpdateValue(foodLabel?.unit, data?.unit),
      amount: newAmount === null ? 0 : newAmount,
    },
    old: {
      title: foodLabel.title,
      foodLabelId: foodLabel.id,
    },
  };

  if (!isAnyValueDefined(newLabelData.new)) {
    console.log("Data provided are identical to current database state.");
    return false;
  }

  return newLabelData;
};
