import prisma from "../utils/prisma.js";
import {  formatTitleCase } from "../utils/stringUtils.js";

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
export const getShoppingListsByInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.shoppingList.findMany({
      where: { inventoryId },
      orderBy: { title: "asc" },
      //   select: {
      //     id: true,
      //     title: true,
      //     status: true,
      //     createdAt: true,
      //     updatedAt: true,
      //     user: {
      //       select: { id: true, username: true },
      //     },
      //     items: {
      //       select: {
      //         id: true,
      //         isChecked: true,
      //       },
      //     },
      //   },
    });
  } catch (error) {
    console.error("Error fetching shopping lists:", error);
    throw error;
  }
};

//vraci nakupni seznam
export const getShoppingListByIdRepository = async (shoppingListId) => {
  try {
    return await prisma.shoppingList.findUnique({
      where: { id: shoppingListId },
      //   select: {
      //     id: true,
      //     title: true,
      //     status: true,
      //     inventoryId: true,
      //     createdAt: true,
      //     updatedAt: true,
      //     user: {
      //       select: { id: true, username: true },
      //     },
      //     items: {
      //       orderBy: { createdAt: "asc" },
      //       select: {
      //         id: true,
      //         quantity: true,
      //         amount: true,
      //         unit: true,
      //         isChecked: true,
      //         checkedAt: true,
      //         customTitle: true,
      //         customDescription: true,
      //         customVariantTitle: true,
      //         customBarcode: true,
      //         estimatedPrice: true,
      //         actualPrice: true,
      //         currency: true,
      //         createdAt: true,
      //         catalog: {
      //           select: { id: true, barcode: true },
      //         },
      //         variant: {
      //           select: { id: true, title: true },
      //         },
      //         label: {
      //           select: {
      //             id: true,
      //             title: true,
      //             description: true,
      //             foodImageUrl: true,
      //           },
      //         },
      //         addedByUser: {
      //           select: { id: true, username: true },
      //         },
      //         checkedByUser: {
      //           select: { id: true, username: true },
      //         },
      //       },
      //     },
      //   },
    });
  } catch (error) {
    console.error("Error fetching shopping list by id:", error);
    throw error;
  }
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
