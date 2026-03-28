import {
  createShoppingListService,
  deleteShoppingListService,
  getShoppingListByIdService,
  getShoppingListsContentService,
  getShoppingListsService,
  updateShoppingListService,
} from "../services/shoppingListService.js";
import handleResponse from "../utils/responseHandler.js";

//vytvori nakupni seznam
export const createShoppingList = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.userId;
    const { title } = req.body;
    const isAdmin = req.adminRoute;

    const list = await createShoppingListService(parseInt(inventoryId, 10), userId, title, isAdmin);
    handleResponse(res, 201, "Shopping list created successfully", list);
  } catch (err) {
    next(err);
  }
};

//updatuje nakupni seznam
export const updateShoppingList = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId } = req.params;
    const userId = req.userId;
    const { title } = req.body;
    const isAdmin = req.adminRoute;

    const list = await updateShoppingListService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      userId,
      title,
      isAdmin,
    );
    handleResponse(res, 200, "Shopping list updated successfully", list);
  } catch (err) {
    next(err);
  }
};

//vraci vsechny nakupni seznam
export const getShoppingListsContent = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const lists = await getShoppingListsContentService(parseInt(inventoryId, 10), userId, isAdmin);
    handleResponse(res, 200, "Shopping lists fetched successfully", lists);
  } catch (err) {
    next(err);
  }
};

//vraci nakupni seznam
export const getShoppingListById = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const list = await getShoppingListByIdService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      userId,
      isAdmin,
    );
    handleResponse(res, 200, "Shopping list fetched successfully", list);
  } catch (err) {
    next(err);
  }
};

//smaze nakupni seznam
export const deleteShoppingList = async (req, res, next) => {
  try {
    const { inventoryId, shoppingListId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    await deleteShoppingListService(
      parseInt(inventoryId, 10),
      parseInt(shoppingListId, 10),
      userId,
      isAdmin,
    );

    handleResponse(res, 200, "Shopping list deleted successfully", null);
  } catch (err) {
    next(err);
  }
};

//vraci seznamy nakupu
export const getShoppingLists = async (req, res, next) => {
  try {
    const { inventoryId } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const lists = await getShoppingListsService(parseInt(inventoryId, 10), userId, isAdmin);

    handleResponse(res, 200, "Shopping lists fetched successfully", lists);
  } catch (err) {
    next(err);
  }
};
