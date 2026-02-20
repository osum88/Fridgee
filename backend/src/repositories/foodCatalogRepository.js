import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

//vytvori novy food catalog
export const createFoodCatalogRepository = async (userId, barcode, tx = prisma) => {
  try {
    return await tx.foodCatalog.create({
      data: {
        barcode: barcode,
        addedBy: userId,
      },
    });
  } catch (error) {
    console.error("Error creating food catalog:", error);
    throw error;
  }
};

//aktualizuje existujici food catalog podle id
export const updateFoodCatalogRepository = async (id, updates) => {
  try {
    const updatedFoodCatalog = await prisma.foodCatalog.update({
      where: { id },
      data: updates,
    });
    const { isDeleted, updateAt, ...rest } = updatedFoodCatalog;
    return rest;
  } catch (error) {
    console.error("Error updating food catalog:", error);
    throw error;
  }
};

//smaze food catalog podle id
export const deleteFoodCatalogRepository = async (catalogId, userId, isAdmin, tx = prisma) => {
  try {
    const foodCatalog = await tx.foodCatalog.findUnique({
      where: { id: catalogId },
    });

    //kontrola valstnictvi a jestli neexistuje barcode (catalog s barcodem se nemaze)
    if (
      !foodCatalog ||
      (!isAdmin && foodCatalog.addedBy !== userId) ||
      foodCatalog?.barcode !== null
    ) {
      return null;
    }

    //kontrola jestli se pouziva
    const affectedFoodCatalog = await tx.foodCatalog.findFirst({
      where: {
        id: catalogId,
        OR: [{ foods: { some: {} } }, { foodHistories: { some: {} } }],
      },
    });

    //pokud se nekde pouziva tak jen soft delete
    if (affectedFoodCatalog) {
      const catalog = await tx.foodCatalog.update({
        where: { id: catalogId },
        data: { isDeleted: true },
      });
      return { ...catalog, deleteCatalogFlag: "SOFT-DELETE" };
    }
    const catalog = await tx.foodCatalog.delete({
      where: { id: catalogId },
    });
    return { ...catalog, deleteCatalogFlag: "HARD-DELETE" };
  } catch (error) {
    console.error("Error deleting food catalog:", error);
    throw error;
  }
};

//vrati food catalog podle id
export const getFoodCatalogByIdRepository = async (id, throwError = true, isDeletedArg = false) => {
  try {
    const foodCatalog = await prisma.foodCatalog.findUnique({
      where: { id },
    });
    //neexistuje zaznam
    if (!foodCatalog) {
      if (throwError) {
        throw new NotFoundError("Food catalog not found.");
      }
      return null;
    }
    //vraci vsechny smazane i nesmazane
    if (isDeletedArg === null) return foodCatalog;
    //kontrola jestli odpovida isDeleted
    if (foodCatalog.isDeleted !== isDeletedArg) {
      return null;
    }
    const { isDeleted, updateAt, ...rest } = foodCatalog;
    return rest;
  } catch (error) {
    console.error("Error fetching food catalog by id:", error);
    throw error;
  }
};

//vrati food catalog podle barcode a uzivatele
export const getFoodCatalogWithLabelByBarcodeRepository = async (
  barcode,
  inventoryId = null,
  userId,
) => {
  try {
    const foodCatalog = await prisma.foodCatalog.findFirst({
      where: {
        barcode: barcode,
      },
      include: {
        labels: {
          where: {
            userId: userId,
            isDeleted: false,
          },
        },
        ...(inventoryId && {
          foods: {
            where: {
              inventoryId: inventoryId,
            },
            select: {
              id: true,
              label: true,
              category: true,
              variant: true,
            },
          },
        }),
      },
    });
    return foodCatalog || null;
  } catch (error) {
    console.error("Error fetching food catalog by barcode and user:", error);
    throw error;
  }
};

//overi ze uzivatel je vlastnikem food katalogu
export const validateCatalogOwnershipRepository = async (id, userId) => {
  try {
    const catalog = await prisma.foodCatalog.findUnique({
      where: { id },
      select: { addedBy: true },
    });
    return catalog?.addedBy === userId;
  } catch (error) {
    console.error("Error validating catalog ownership:", error);
    throw error;
  }
};
