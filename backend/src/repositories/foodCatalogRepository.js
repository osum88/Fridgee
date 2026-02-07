import { Prisma } from "@prisma/client";
import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

//vytvori novy food catalog
export const createFoodCatalogRepository = async (userId, barcode, tx = prisma) => {
  try {
    const newFoodCatalog = await tx.foodCatalog.create({
      data: {
        barcode: barcode,
        addedBy: userId,
      },
    });
    return newFoodCatalog;
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
export const deleteFoodCatalogRepository = async (id) => {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // smaze labely
      await tx.foodLabel.deleteMany({
        where: { catalogId: id },
      });

      // pak katalog
      const deletedCatalog = await tx.foodCatalog.delete({
        where: { id },
      });

      return deletedCatalog;
    });
    return result;
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
export const getFoodCatalogByBarcodeRepository = async (barcode, addedBy, isDeleted = false) => {
  try {
    const foodCatalog = await prisma.foodCatalog.findFirst({
      where: {
        barcode: barcode,
        addedBy: addedBy,
        isDeleted: isDeleted !== null ? isDeleted : undefined,
      },
    });
    //neexistuje zaznam
    if (!foodCatalog) return null;
    return foodCatalog;
  } catch (error) {
    console.error("Error fetching food catalog by barcode and user:", error);
    throw error;
  }
};

//@TODO mozna pridat catalogy kde neni owner ale ma vytvoreny label
//vrati vsechny food katalogy pridane uzivatelem
export const getAllFoodCatalogsByUserRepository = async (userId) => {
  try {
    const catalogs = await prisma.foodCatalog.findMany({
      where: {
        addedBy: userId,
        isDeleted: false,
      },
      orderBy: { createdAt: "desc" },
      include: {
        labels: {
          where: { userId },
        },
      },
    });

    return catalogs.map((catalog) => {
      const { labels, isDeleted, updateAt, ...rest } = catalog;
      return {
        ...rest,
        title: labels[0]?.title ?? null,
        description: labels[0]?.description ?? null,
        foodImageUrl: labels[0]?.foodImageUrl ?? null,
        price: labels[0]?.price ?? null,
        unit: labels[0]?.unit ?? null,
        amount: labels[0]?.amount ?? null,
      };
    });
  } catch (error) {
    console.error("Error fetching user food catalogs:", error);
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

// getFoodCatalogWithVariantsRepository

//searchFoodCatalogsRepository
//vyhleda food katalogy podle title a uzivatele, a path(jazyk)
