import prisma from "../utils/prisma.js";
import { formatTitleCase } from "../utils/stringUtils.js";

//vytvori nakupni seznam
export const createShoppingListRepository = async (inventoryId, userId, title) => {
  try {
    return await prisma.shoppingList.create({
      data: {
        inventoryId: inventoryId,
        createdBy: userId,
        title: formatTitleCase(title),
      },
    });
  } catch (error) {
    console.error("Error creating shopping list:", error);
    throw error;
  }
};

//updatuje nakupni seznam
export const updateShoppingListRepository = async (shoppingListId, data) => {
  try {
    return await prisma.shoppingList.update({
      where: { id: shoppingListId },
      data: {
        title: formatTitleCase(data?.title),
        status: data?.status,
      },
    });
  } catch (error) {
    console.error("Error updating shopping list:", error);
    throw error;
  }
};

//vraci vsechny nakupni seznam
export const getShoppingListsByInventoryContentRepository = async (inventoryId, userId) => {
  try {
    return await prisma.shoppingList.findMany({
      where: {
        inventoryId: inventoryId,
      },
      select: shoppingListSelect(userId),
    });
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    throw error;
  }
};

//vraci nakupni seznam
export const getShoppingListByIdRepository = async (shoppingListId, userId) => {
  try {
    return await prisma.shoppingList.findUnique({
      where: { id: shoppingListId },
      select: shoppingListSelect(userId),
    });
  } catch (error) {
    console.error("Error fetching shopping list by id:", error);
    throw error;
  }
};

const shoppingListSelect = (userId) => {
  return {
    id: true,
    inventoryId: true,
    title: true,
    status: true,
    items: {
      select: {
        id: true,
        shoppingListId: true,
        catalogId: true,
        customTitle: true,
        customNormalizedTitle: true,
        customDescription: true,
        customVariantTitle: true,
        customBarcode: true,
        quantity: true,
        amount: true,
        unit: true,
        estimatedPrice: true,
        currency: true,
        isChecked: true,
        catalog: {
          select: {
            barcode: true,
            labels: {
              where: { userId: userId, isDeleted: false },
              select: { id: true, title: true },
            },
          },
        },
        label: {
          select: { id: true, title: true },
        },
      },
    },
  };
};

//vraci nakupni seznam
export const getShoppingListByTitleRepository = async (
  inventoryId,
  title,
  shoppingListId = null,
) => {
  const id = shoppingListId ? { NOT: { id: shoppingListId } } : {};
  try {
    return await prisma.shoppingList.findFirst({
      where: {
        ...id,
        inventoryId: inventoryId,
        title: formatTitleCase(title),
      },
    });
  } catch (error) {
    console.error("Error fetching shopping list by id:", error);
    throw error;
  }
};

//smaze nakupni seznam
export const deleteShoppingListRepository = async (shoppingListId) => {
  try {
    return await prisma.shoppingList.delete({
      where: { id: shoppingListId },
    });
  } catch (error) {
    console.error("Error deleting shopping list:", error);
    throw error;
  }
};

//vraci nakupni seznamy
export const getShoppingListsByInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.shoppingList.findMany({
      where: { inventoryId },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
        status: true,
        _count: {
          select: { items: true },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching shopping lists light:", error);
    throw error;
  }
};
