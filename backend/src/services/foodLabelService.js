import { BadRequestError } from "../errors/errors.js";
import {
  createFoodLabelRepository,
  getFoodLabelByUserIdCatalogIdRepository,
  updateFoodLabelRepository,
} from "../repositories/foodLabelRepository.js";

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
  const label = await getFoodLabelByUserIdCatalogIdRepository(
    targetUserId,
    foodCatalogId,
  );

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
export const getFoodLabelByIdService = async (
  foodCatalogId,
  ownerId,
  userId,
  isAdmin,
) => {
  const userLabel = !isAdmin
    ? await getFoodLabelByUserIdCatalogIdRepository(userId, foodCatalogId)
    : null;

  const originalLabel = await getFoodLabelByUserIdCatalogIdRepository(
    ownerId,
    foodCatalogId,
  );

  return mergeLabels(userLabel, originalLabel);
};

//pokud existuje pouzije se uzivatelsky popisek jinak se pouziva puvodni
//description lze explicitne smazat ostatni se jen prepisuji
const mergeLabels = (userLabel, originalLabel) => {
  return {
    title: userLabel?.title || originalLabel?.title || null,
    description: userLabel?.description ?? originalLabel?.description ?? null,
    foodImageUrl:
      userLabel?.foodImageUrl || originalLabel?.foodImageUrl || null,
    price: userLabel?.price ?? originalLabel?.price ?? null,
    unit: userLabel?.unit ?? originalLabel?.unit ?? null,
    amount: userLabel?.amount ?? originalLabel?.amount ?? null,
  };
};
