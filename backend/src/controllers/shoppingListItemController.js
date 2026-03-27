import {
  createShoppingListItemService,
  deleteShoppingListItemService,
  updateShoppingListItemService,
} from "../services/shoppingListItemService.js";
import handleResponse from "../utils/responseHandler.js";

//vytvori item v nakupnim seznamu
export const createShoppingListItem = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const item = await createShoppingListItemService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      userId,
      req.body,
      isAdmin,
    );
    handleResponse(res, 201, "Shopping list item created successfully", item);
  } catch (err) {
    next(err);
  }
};

//upravi item v nakupnim seznamu
export const updateShoppingListItem = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId, itemId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const item = await updateShoppingListItemService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      parseInt(itemId, 10),
      userId,
      req.body,
      isAdmin,
    );
    handleResponse(res, 200, "Shopping list item updated successfully", item);
  } catch (err) {
    next(err);
  }
};

//smaze item v nakupnim seznamu
export const deleteShoppingListItem = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId, itemId } = req.params;
    const { quantityToRemove } = req.body;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    await deleteShoppingListItemService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      parseInt(itemId, 10),
      userId,
      isAdmin,
      quantityToRemove ? parseInt(quantityToRemove, 10) : undefined,
    );
    handleResponse(res, 200, "Shopping list item deleted successfully", null);
  } catch (err) {
    next(err);
  }
};
