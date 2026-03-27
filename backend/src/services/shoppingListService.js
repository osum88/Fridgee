import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/errors.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import { getActiveFoodVariantsRepository } from "../repositories/foodVariantRepository.js";
import {
  createShoppingListRepository,
  getShoppingListByIdRepository,
  getShoppingListByTitleRepository,
  getShoppingListsByInventoryRepository,
  updateShoppingListRepository,
} from "../repositories/shoppingListRepository.js";
import { sortBy } from "../utils/sort.js";
import { formatTitleCase } from "../utils/stringUtils.js";

//vytvori nakupni seznam
export const createShoppingListService = async (inventoryId, userId, title, isAdmin) => {
  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError(
        "You do not have permission to create shopping list this inventory.",
      );
    }
  }
  const shoppingList = await getShoppingListByTitleRepository(inventoryId, title);
  if (shoppingList) {
    throw new BadRequestError("Shopping list with this title already exists", {
      type: "shoppingListTitle",
      code: "ALREADY_EXISTS",
    });
  }
  return await createShoppingListRepository(inventoryId, userId, title);
};

//updatuje nakupni seznam
export const updateShoppingListService = async (
  inventoryId,
  shoppingListId,
  userId,
  title,
  isAdmin,
) => {
  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError(
        "You do not have permission to update shopping list this inventory.",
      );
    }
  }

  const shoppingList = await getShoppingListByIdRepository(shoppingListId);
  if (!shoppingList || shoppingList.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }
  if (shoppingList?.title === formatTitleCase(title)) {
    return shoppingList;
  }

  const duplicate = await getShoppingListByTitleRepository(inventoryId, title, shoppingListId);
  if (duplicate) {
    throw new BadRequestError("Shopping list with this title already exists", {
      type: "shoppingListTitle",
      code: "ALREADY_EXISTS",
    });
  }
  return await updateShoppingListRepository(shoppingListId, { title });
};

//vraci vsechny nakupni seznam
export const getShoppingListsService = async (inventoryId, userId, isAdmin) => {
  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError(
        "You do not have permission to update shopping list this inventory.",
      );
    }
  }

  const lists = await getShoppingListsByInventoryRepository(inventoryId, userId);
  if (!lists) {
    return [];
  }
  const sortedLists = sortBy(lists, "title", { secondaryKey: "id" });

  return sortedLists.map((list) => {
    const mappedItems = list.items.map((item) => {
      const barcode = item?.catalogId ? item?.catalog?.barcode : item?.customBarcode;
      const activeLabel = item?.catalog?.labels[0] || item?.label || null;

      const labelData = activeLabel
        ? {
            customTitle: activeLabel?.title || "",
            customNormalizedTitle: activeLabel?.normalizedTitle || "",
            foodImageUrl: activeLabel?.foodImageUrl || "",
            foodImageCloudId: activeLabel?.foodImageCloudId || null,
          }
        : {
            customTitle: item?.customTitle || "",
            customNormalizedTitle: item?.customNormalizedTitle || "",
            foodImageUrl: "",
            foodImageCloudId: null,
          };

      return {
        id: item.id,
        shoppingListId: item.shoppingListId,
        catalogId: item?.catalogId,
        customBarcode: barcode || "",
        ...labelData,
        customVariantTitle: item?.customVariantTitle || "",
        customeDescription: item?.customDescription || "",
        price: item?.estimatedPrice || 0,
        unit: item?.unit || "",
        amount: item?.amount || 0,
        quantity: item?.quantity || 0,
        currency: item?.currency || "CZK",
        isChecked: item?.isChecked,
      };
    });

    const sortedItems = sortBy(mappedItems, "customTitle", {
      secondaryKey: "customVariantTitle",
      tertiaryKey: "id",
    }).sort((a, b) => {
      if (a.isChecked === b.isChecked) return 0;
      return a.isChecked ? 1 : -1;
    });

    return {
      id: list.id,
      shoppingListTitle: list?.title,
      status: list?.status,
      inventoryId: inventoryId,
      items: sortedItems,
    };
  });
};

//vraci nakupni seznam
export const getShoppingListByIdService = async (inventoryId, shoppingListId, userId, isAdmin) => {
  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError(
        "You do not have permission to update shopping list this inventory.",
      );
    }
  }

  const list = await getShoppingListByIdRepository(shoppingListId, userId);
  if (!list || list.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }

  const mappedItems = list.items.map((item) => {
    const barcode = item?.catalogId ? item?.catalog?.barcode : item?.customBarcode;
    const activeLabel = item?.catalog?.labels[0] || item?.label || null;

    const labelData = activeLabel
      ? {
          customTitle: activeLabel?.title || "",
          customNormalizedTitle: activeLabel?.normalizedTitle || "",
          foodImageUrl: activeLabel?.foodImageUrl || "",
          foodImageCloudId: activeLabel?.foodImageCloudId || null,
        }
      : {
          customTitle: item?.customTitle || "",
          customNormalizedTitle: item?.customNormalizedTitle || "",
          foodImageUrl: "",
          foodImageCloudId: null,
        };

    return {
      id: item.id,
      shoppingListId: item.shoppingListId,
      catalogId: item?.catalogId,
      customBarcode: barcode || "",
      ...labelData,
      customVariantTitle: item?.customVariantTitle || "",
      customeDescription: item?.customDescription || "",
      price: item?.estimatedPrice || 0,
      unit: item?.unit || "",
      amount: item?.amount || 0,
      quantity: item?.quantity || 0,
      currency: item?.currency || "CZK",
      isChecked: item?.isChecked,
    };
  });

  const sortedItems = sortBy(mappedItems, "customTitle", {
    secondaryKey: "customVariantTitle",
    tertiaryKey: "id",
  }).sort((a, b) => {
    if (a.isChecked === b.isChecked) return 0;
    return a.isChecked ? 1 : -1;
  });

  return {
    id: list.id,
    shoppingListTitle: list?.title,
    status: list?.status,
    inventoryId: inventoryId,
    items: sortedItems,
  };
};
