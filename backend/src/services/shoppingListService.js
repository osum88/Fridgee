import { BadRequestError, ForbiddenError, NotFoundError } from "../errors/errors.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
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

  const lists = await getShoppingListsByInventoryRepository(inventoryId);
  const sorted = sortBy(lists, "title");
  return sorted.map((list) => ({
    ...list,
    // totalItems: list.items.length,
    // checkedItems: list.items.filter((i) => i.isChecked).length,
    // items: undefined,
  }));
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

  const list = await getShoppingListByIdRepository(shoppingListId);
  if (!list || list.inventoryId !== inventoryId) {
    throw new NotFoundError("Shopping list not found");
  }
  return list;
};
