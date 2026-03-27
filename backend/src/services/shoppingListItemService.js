import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import { getFoodByCatalogIdRepository } from "../repositories/foodCatalogRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import { getFoodByIdRepository } from "../repositories/foodRepository.js";
import {
  createShoppingListItemRepository,
  decrementShoppingListItemQuantity,
  deleteShoppingListItemRepository,
  getShoppingListItemByIdRepository,
  getShoppingListItemByUniqueKeyRepository,
  getShoppingListItemDetailByIdRepository,
  incrementShoppingListItemQuantity,
  splitAndMergeOnCheckRepository,
  splitAndMergeOnUpdateRepository,
  updateShoppingListItemRepository,
} from "../repositories/shoppingListItemRepository.js";
import { getShoppingListByIdRepository } from "../repositories/shoppingListRepository.js";
import {
  buildShoppingListItemKey,
  determineUpdateValue,
  formatTitleCase,
  isAnyValueDefined,
  normalizeText,
} from "../utils/stringUtils.js";
import { updateOrCreateFoodLabelService } from "./foodLabelService.js";
import { createBaseCurrency } from "./priceService.js";

//vytvori item v nakupnim seznamu
export const createShoppingListItemService = async (
  inventoryId,
  shoppingListId,
  userId,
  data,
  isAdmin,
) => {
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError("You do not have permission to add items to this shopping list.");
    }
  }

  const shoppingList = await getShoppingListByIdRepository(shoppingListId);
  if (!shoppingList || shoppingList.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }
  if (shoppingList.status !== "ACTIVE") {
    throw new BadRequestError("Cannot add items to a non-active shopping list");
  }

  const itemId = parseInt(data?.itemId, 10) || null;

  //SITUACE 1: mam itemId tak jen zvysime mnozstvi
  if (itemId) {
    const item = await getShoppingListItemByIdRepository(itemId);
    if (item) {
      return await incrementShoppingListItemQuantity(itemId, data?.quantity ?? 1);
    }
  }

  const title = formatTitleCase(data?.customTitle, false);

  let existFoodData = {};
  let food = null;
  let userLabel = null;
  let catalogId = null;
  let defaultLabel = null;
  let customVariantTitle = formatTitleCase(data?.customVariantTitle) || null;
  let customBarcode = data?.customBarcode || null;

  //SITUACE 2: mam foodId, najdu food pak hledam item podle jeho catalogId
  if (data.foodId) {
    // pokud ma foodId, overime ze food patri do inventare
    food = await getFoodByIdRepository(data.foodId, userId, false);
    if (!food || food.inventoryId !== inventoryId) {
      throw new NotFoundError("Food not found in this inventory");
    }
    userLabel = food?.catalog?.labels[0] || null;
    catalogId = food?.catalogId || null;
    defaultLabel = food?.label || null;
    customVariantTitle = food?.variant?.title || null;
    customBarcode = food?.catalog?.barcode || null;
  }

  //SITUACE 3: mam catalogId, najdu food podle nej a pak hledam item
  if (data?.catalogId) {
    if (!food) {
      food = await getFoodByCatalogIdRepository(data?.catalogId, inventoryId, userId);
      userLabel = food?.labels[0] || null;
      catalogId = data?.catalogId;
      defaultLabel = food?.foods[0]?.label || userLabel;
      customBarcode = food?.barcode || null;
    }
  }

  const currency = await createBaseCurrency(userId, data?.currency);
  const uniqueKey = buildShoppingListItemKey({
    ...data,
    currency,
    customVariantTitle,
    customBarcode,
  });

  //pokud userlabel existuje a ma jiny lable upravime, pokud neexistuje tak se vytvori
  if (userLabel && title && title !== userLabel?.title) {
    updateOrCreateFoodLabelService(
      userId,
      {
        foodLabelId: userLabel.id,
        title: title,
      },
      isAdmin,
    ).catch((err) => console.error("Failed to update food label:", err));
  } else if (!userLabel && defaultLabel) {
    updateOrCreateFoodLabelService(
      userId,
      {
        foodLabelId: defaultLabel.id,
        title: title,
        foodImageUrl: null,
        foodImageCloudId: null,
      },
      isAdmin,
    ).catch((err) => console.error("Failed to create food label:", err));
  }

  if (catalogId) {
    const itemByCatalogId = await getShoppingListItemByUniqueKeyRepository(
      shoppingListId,
      uniqueKey,
      { catalogId },
    );
    if (itemByCatalogId) {
      return await incrementShoppingListItemQuantity(itemByCatalogId.id, data?.quantity ?? 1);
    }

    if (title && title !== defaultLabel?.title) {
      existFoodData = {
        customTitle: title || defaultLabel?.title || null,
        customNormalizedTitle:
          normalizeText(data?.customTitle) || defaultLabel?.normalizedTitle || null,
      };
    } else {
      existFoodData = {
        customTitle: defaultLabel?.title || null,
        customNormalizedTitle: defaultLabel?.normalizedTitle || null,
      };
    }

    existFoodData = {
      ...existFoodData,
      catalogId: catalogId,
      defaultLabelId: defaultLabel?.id || null,
      customDescription: data?.description || null,
      customVariantTitle: customVariantTitle,
      customBarcode: customBarcode,
    };
  }

  //SITUACE 4: hleda podle title a klice jestli item neexistuje
  if (data?.customTitle && !catalogId) {
    const itemByTitle = await getShoppingListItemByUniqueKeyRepository(shoppingListId, uniqueKey, {
      customNormalizedTitle: normalizeText(data?.customTitle),
    });
    if (itemByTitle) {
      return await incrementShoppingListItemQuantity(itemByTitle.id, data?.quantity ?? 1);
    }
  }

  const itemData = {
    ...(Object.keys(existFoodData).length > 0
      ? { ...existFoodData }
      : {
          customTitle: title,
          customNormalizedTitle: normalizeText(data?.customTitle),
          customDescription: data?.customDescription || null,
          customVariantTitle: customVariantTitle || null,
          customBarcode: data?.customBarcode || null,
        }),
    quantity: data?.quantity ?? 1,
    amount: data?.amount ?? 0,
    unit: data?.unit ?? null,
    estimatedPrice: data?.estimatedPrice ?? 0,
    currency: currency,
    addedBy: userId,
    uniqueKey,
  };

  return await createShoppingListItemRepository(shoppingListId, itemData);
};

//upravi item v nakupnim seznamu
export const updateShoppingListItemService = async (
  inventoryId,
  shoppingListId,
  itemId,
  userId,
  data,
  isAdmin,
) => {
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError("You do not have permission to update items in this shopping list.");
    }
  }

  const shoppingList = await getShoppingListByIdRepository(shoppingListId);
  if (!shoppingList || shoppingList.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }

  const item = await getShoppingListItemDetailByIdRepository(itemId, userId);
  if (!item || item.shoppingListId !== shoppingListId) {
    throw new NotFoundError("Shopping list item not found");
  }

  //pokud jen odskrteneme jidlo
  if (data.isChecked !== undefined) {
    const checked = !!data.isChecked;
    if (item?.isChecked === checked) {
      return item;
    }
    return await splitAndMergeOnCheckRepository(
      itemId,
      data?.quantity ?? item?.quantity,
      checked,
      userId,
    );
  }

  //barcode se muze zmenit jen pokud neexistuje catalog
  if (
    data.customBarcode !== undefined &&
    data.customBarcode !== item?.customBarcode &&
    item.catalogId
  ) {
    throw new BadRequestError("Cannot change barcode of item linked to catalog", {
      type: "barcode",
      code: "CANNOT_CHANGE_EXIST_CATALOG",
    });
  }

  const defaultLabel = item?.label;
  const title = formatTitleCase(data?.customTitle, false);

  if (title && defaultLabel) {
    const userLabel = item?.catalog?.labels[0];

    //pokud userlabel existuje a ma jiny lable upravime, pokud neexistuje tak se vytvori
    if (userLabel && title && title !== userLabel?.title) {
      updateOrCreateFoodLabelService(
        userId,
        {
          foodLabelId: userLabel.id,
          title: title,
        },
        isAdmin,
      ).catch((err) => console.error("Failed to update food label:", err));
    } else if (!userLabel && defaultLabel) {
      updateOrCreateFoodLabelService(
        userId,
        {
          foodLabelId: defaultLabel.id,
          title: title,
          foodImageUrl: null,
          foodImageCloudId: null,
        },
        isAdmin,
      ).catch((err) => console.error("Failed to create food label:", err));
    }
  }

  // vytvorime pokud se title meni a neexistuje defaultLabel
  const titleData =
    title && !defaultLabel && title !== item?.customTitle
      ? {
          customTitle: title,
          customNormalizedTitle: normalizeText(data.customTitle),
        }
      : {};

  //data co se mohou menit soucastne
  const rawCatalogScopedData = {
    amount: determineUpdateValue(item?.amount, data?.amount, true),
    unit: determineUpdateValue(item?.unit, data?.unit),
    estimatedPrice: determineUpdateValue(item?.estimatedPrice, data?.estimatedPrice, true),
    currency: determineUpdateValue(item?.currency, data?.currency),
    customVariantTitle: determineUpdateValue(item?.customVariantTitle, data?.customVariantTitle),
  };

  //data co se mohou menit jako celek
  const rawKeyData = {
    customDescription: determineUpdateValue(item?.customDescription, data?.customDescription),
    customBarcode: determineUpdateValue(item?.customBarcode, data?.customBarcode),
    ...titleData,
  };

  const clean = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined));

  const catalogScopedData = clean(rawCatalogScopedData);
  const keyData = clean(rawKeyData);

  if (Object.keys(keyData).length === 0 && Object.keys(catalogScopedData).length === 0) {
    return false;
  }

  return await splitAndMergeOnUpdateRepository(
    itemId,
    data?.quantity ?? item.quantity,
    keyData,
    catalogScopedData,
  );
};

//smaze item v nakupnim seznamu
export const deleteShoppingListItemService = async (
  inventoryId,
  shoppingListId,
  itemId,
  userId,
  isAdmin,
  quantityToRemove,
) => {
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError(
        "You do not have permission to delete items from this shopping list.",
      );
    }
  }

  const shoppingList = await getShoppingListByIdRepository(shoppingListId);
  if (!shoppingList || shoppingList.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }

  const item = await getShoppingListItemByIdRepository(itemId);
  if (!item || item.shoppingListId !== shoppingListId) {
    throw new NotFoundError("Shopping list item not found");
  }

  //snizeni quantity
  if (quantityToRemove !== undefined) {
    if (item.quantity - quantityToRemove > 0) {
      return await decrementShoppingListItemQuantity(itemId, quantityToRemove);
    }
  }
  return await deleteShoppingListItemRepository(itemId);
};
