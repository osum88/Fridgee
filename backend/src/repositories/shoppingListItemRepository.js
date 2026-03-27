import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import {
  buildShoppingListItemKey,
  isAnyValueDefined,
  normalizeText,
} from "../utils/stringUtils.js";

export const createShoppingListItemRepository = async (shoppingListId, data, tx = prisma) => {
  try {
    return await tx.shoppingListItem.create({
      data: {
        shoppingListId,
        ...data,
      },
    });
  } catch (error) {
    console.error("Error creating shopping list item:", error);
    throw error;
  }
};

export const updateShoppingListItemRepository = async (itemId, data, tx = prisma) => {
  try {
    return await tx.shoppingListItem.update({
      where: { id: itemId },
      data,
    });
  } catch (error) {
    console.error("Error updating shopping list item:", error);
    throw error;
  }
};

export const deleteShoppingListItemRepository = async (itemId, tx = prisma) => {
  try {
    return await tx.shoppingListItem.delete({
      where: { id: itemId },
    });
  } catch (error) {
    console.error("Error deleting shopping list item:", error);
    throw error;
  }
};

//vraci item
export const getShoppingListItemByIdRepository = async (itemId) => {
  try {
    return await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
    });
  } catch (error) {
    console.error("Error fetching shopping list item:", error);
    throw error;
  }
};

// zvyseni quantity itemu
export const incrementShoppingListItemQuantity = async (itemId, quantity = 1, tx = prisma) => {
  try {
    return await tx.shoppingListItem.update({
      where: { id: itemId },
      data: {
        quantity: { increment: quantity },
      },
    });
  } catch (error) {
    console.error("Error incrementing shopping list item quantity:", error);
    throw error;
  }
};

// zvyseni quantity itemu
export const decrementShoppingListItemQuantity = async (itemId, quantity = 1, tx = prisma) => {
  try {
    return await tx.shoppingListItem.update({
      where: { id: itemId },
      data: {
        quantity: { decrement: quantity },
      },
    });
  } catch (error) {
    console.error("Error incrementing shopping list item quantity:", error);
    throw error;
  }
};

//hleda podle unikaniho klice a argumentu
export const getShoppingListItemByUniqueKeyRepository = async (
  shoppingListId,
  uniqueKey,
  { catalogId = null, customNormalizedTitle = null } = {},
) => {
  try {
    return await prisma.shoppingListItem.findFirst({
      where: {
        shoppingListId,
        uniqueKey,
        isChecked: false,
        ...(catalogId && { catalogId }),
        ...(customNormalizedTitle && { customNormalizedTitle }),
      },
    });
  } catch (error) {
    console.error("Error fetching shopping list item by unique key:", error);
    throw error;
  }
};

//vraci item vcetne detailu
export const getShoppingListItemDetailByIdRepository = async (itemId, userId, inventoryId) => {
  try {
    return await prisma.shoppingListItem.findUnique({
      where: { id: itemId },
      include: {
        catalog: {
          include: {
            labels: {
              where: { userId: userId, isDeleted: false },
              select: {
                id: true,
                title: true,
                normalizedTitle: true,
                description: true,
                foodImageUrl: true,
              },
            },
            foods: {
              where: {
                inventoryId: inventoryId,
              },
              select: {
                variant: { select: { id: true, title: true } },
                category: { select: { id: true, title: true } },
              },
            },
          },
        },
        label: {
          select: {
            id: true,
            title: true,
            normalizedTitle: true,
            description: true,
            foodImageUrl: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching shopping list item detail:", error);
    throw error;
  }
};

//rozdeli item a sloucime pro check itemu
export const splitAndMergeOnCheckRepository = async (itemId, quantity, isChecked, userId) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const original = await tx.shoppingListItem.findUnique({
        where: { id: itemId },
      });

      if (!original) throw new NotFoundError("Shopping list item not found");

      const resultQuantity = Math.min(quantity, original.quantity);

      //data pro check
      const checkData = isChecked
        ? {
            isChecked: isChecked,
            checkedBy: userId,
            checkedAt: new Date(),
          }
        : {
            isChecked: isChecked,
            checkedBy: null,
            checkedAt: null,
          };

      //pokusi se najit stejnou polozku a pripadne je jen sloucit
      let sameItemFinded = null;
      if (original?.catalogId && original?.defaultLabelId) {
        sameItemFinded = await tx.shoppingListItem.findFirst({
          where: {
            shoppingListId: original.shoppingListId,
            catalogId: original?.catalogId,
            defaultLabelId: original?.defaultLabelId,
            uniqueKey: original?.uniqueKey,
            isChecked: isChecked,
          },
        });
      } else {
        sameItemFinded = await tx.shoppingListItem.findFirst({
          where: {
            shoppingListId: original.shoppingListId,
            customNormalizedTitle: original?.customNormalizedTitle,
            uniqueKey: original?.uniqueKey,
            isChecked: isChecked,
          },
        });
      }

      //pokud menime vsechno
      if (quantity >= original.quantity) {
        if (sameItemFinded) {
          // existuje duplicate -> smaze original a sluci s duplicate
          await deleteShoppingListItemRepository(itemId, tx);
          return await incrementShoppingListItemQuantity(sameItemFinded.id, resultQuantity, tx);
        }
        // neni co sloucit -> jen updatuje original
        return await updateShoppingListItemRepository(itemId, { ...checkData }, tx);
      }

      // presouva jen cast
      await decrementShoppingListItemQuantity(itemId, resultQuantity, tx);

      if (sameItemFinded) {
        // existuje duplicate -> slouci
        return await incrementShoppingListItemQuantity(sameItemFinded.id, resultQuantity, tx);
      }

      // neni co sloucit -> vytvori novy item
      const { id, createdAt, shoppingListId, ...rest } = original;
      return await createShoppingListItemRepository(
        shoppingListId,
        { ...rest, ...checkData, quantity: resultQuantity },
        tx,
      );
    });
  } catch (error) {
    console.error("Error splitting and merging on check shopping list item:", error);
    throw error;
  }
};

//rozdeli item a sloucime pro update
export const splitAndMergeOnUpdateRepository = async (
  itemId,
  quantity,
  catalogScopedData,
  keyData,
) => {
  try {
    return await prisma.$transaction(async (tx) => {
      let original = await tx.shoppingListItem.findUnique({
        where: { id: itemId },
      });

      if (!original) throw new NotFoundError("Shopping list item not found");

      // pokud se klic nezmenil, jenom updatuje
      if (Object.keys(catalogScopedData).length !== 0) {
        let uniqueKey = original?.uniqueKey;

        if (catalogScopedData?.customBarcode) {
          uniqueKey = buildShoppingListItemKey({
            ...original,
            customBarcode: catalogScopedData?.customBarcode,
          });
        }

        const sameByTitle = await tx.shoppingListItem.findFirst({
          where: {
            id: { not: itemId },
            shoppingListId: original.shoppingListId,
            customNormalizedTitle:
              catalogScopedData.customNormalizedTitle ?? original.customNormalizedTitle,
            uniqueKey: uniqueKey,
            isChecked: original.isChecked,
          },
        });

        if (sameByTitle) {
          await deleteShoppingListItemRepository(itemId, tx);
          original = await updateShoppingListItemRepository(
            sameByTitle.id,
            {
              quantity: { increment: original.quantity },
              ...catalogScopedData,
            },
            tx,
          );
        } else {
          original = await updateShoppingListItemRepository(
            itemId,
            {
              ...catalogScopedData,
              uniqueKey: uniqueKey,
            },
            tx,
          );
        }
      }

      // prepocita uniqueKey s novymi daty
      const newItemData = { ...original, ...catalogScopedData, ...keyData };
      const newUniqueKey = buildShoppingListItemKey(newItemData);
      const keyChanged = newUniqueKey !== original.uniqueKey;

      if (!keyChanged || Object.keys(keyData).length === 0) {
        return original;
      }

      const resultQuantity = Math.min(quantity, original.quantity);

      //pokusi se najit stejnou polozku a pripadne je jen sloucit
      let sameItemFinded = null;
      if (original?.catalogId && original?.defaultLabelId) {
        sameItemFinded = await tx.shoppingListItem.findFirst({
          where: {
            id: { not: itemId },
            shoppingListId: original.shoppingListId,
            catalogId: original.catalogId,
            defaultLabelId: original.defaultLabelId,
            uniqueKey: newUniqueKey,
            isChecked: original.isChecked,
          },
        });
      } else {
        sameItemFinded = await tx.shoppingListItem.findFirst({
          where: {
            id: { not: itemId },
            shoppingListId: original.shoppingListId,
            customNormalizedTitle:
              newItemData.customNormalizedTitle ?? original.customNormalizedTitle,
            uniqueKey: newUniqueKey,
            isChecked: original.isChecked,
          },
        });
      }

      //pokud menime vsechno
      if (quantity >= original.quantity) {
        if (sameItemFinded) {
          // existuje duplicate -> smaze original a slouci s duplicate
          await deleteShoppingListItemRepository(itemId, tx);
          return await incrementShoppingListItemQuantity(sameItemFinded.id, resultQuantity, tx);
        }

        // neni co sloucit -> jen updatuje original
        return await updateShoppingListItemRepository(
          itemId,
          { ...keyData, uniqueKey: newUniqueKey },
          tx,
        );
      }

      // presouva jen cast
      await decrementShoppingListItemQuantity(itemId, resultQuantity, tx);

      if (sameItemFinded) {
        // existuje duplicate -> slouci
        return await incrementShoppingListItemQuantity(sameItemFinded.id, resultQuantity, tx);
      }

      // neni co sloucit -> vytvori novy item
      const { id, createdAt, shoppingListId, ...rest } = original;
      return await createShoppingListItemRepository(
        shoppingListId,
        { ...rest, ...keyData, quantity: resultQuantity, uniqueKey: newUniqueKey },
        tx,
      );
    });
  } catch (error) {
    console.error("Error splitting and merging on update shopping list item:", error);
    throw error;
  }
};
