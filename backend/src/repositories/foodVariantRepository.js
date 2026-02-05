import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { formatTitleCase } from "../utils/stringUtils.js";

// vytvori novou variantu
export const createFoodVariantRepository = async (data) => {
  try {
    const newVariant = await prisma.foodVariant.create({
      data,
    });
    return newVariant;
  } catch (error) {
    console.error("Error creating food variant:", error);
    throw error;
  }
};

// vrati variantu podle id
export const getFoodVariantByIdRepository = async (id, throwError = true) => {
  try {
    const variant = await prisma.foodVariant.findUnique({
      where: { id },
    });
    if (!variant && throwError) {
      throw new NotFoundError("Food variant not found.");
    }
    return variant;
  } catch (error) {
    console.error("Error fetching food variant:", error);
    throw error;
  }
};

// nacte vsechny varianty z catalogu
export const getAllFoodVariantsRepository = async (catalogId) => {
  try {
    const variants = await prisma.foodVariant.findMany({
      where: { foodCatalogId: catalogId },
      orderBy: { title: "asc" },
    });
    return variants;
  } catch (error) {
    console.error("Error fetching all food variants:", error);
    throw error;
  }
};

//@TODO vratit i varianty co se pouzivaji v inventari (isDeleted pro user, invetnater muzu byt true)
// nacte vsechny uzivatelovy varianty z catalogu nebo ty co se pouzivaji v inventari
export const getRelevantFoodVariantsRepository = async (catalogId, userId) => {
  try {
    const variants = await prisma.foodVariant.findMany({
      where: {
        foodCatalogId: catalogId,
        addedBy: userId,
      },
      orderBy: { title: "asc" },
      select: {
        id: true,
        title: true,
      },
    });
    return variants;
  } catch (error) {
    console.error("Error fetching all relevantfood variants:", error);
    throw error;
  }
};

// aktualizuje variantu podle id
export const updateFoodVariantRepository = async (id, data) => {
  try {
    const updatedVariant = await prisma.foodVariant.update({
      where: { id },
      data,
    });
    return updatedVariant;
  } catch (error) {
    console.error("Error updating food variant:", error);
    throw error;
  }
};

// smaze variantu podle id
export const deleteFoodVariantRepository = async (id) => {
  try {
    const deletedVariant = await prisma.foodVariant.delete({
      where: { id },
    });
    return deletedVariant;
  } catch (error) {
    console.error("Error deleting food variant:", error);
    throw error;
  }
};

// vrati variantu podle title v danem katalogu pro daneho uzivatele
export const getFoodVariantByTitleRepository = async (
  title,
  foodCatalogId,
  userId,
  isDeleted = false,
) => {
  try {
    const variant = await prisma.foodVariant.findFirst({
      where: {
        title: title,
        foodCatalogId: foodCatalogId,
        addedBy: userId,
        isDeleted: isDeleted !== null ? isDeleted : undefined,
      },
    });
    return variant;
  } catch (error) {
    console.error("Error fetching food variant by title:", error);
    throw error;
  }
};

// najde nebo vytvori variantu a vrati id
export const getOrCreateFoodVariant = async (
  userId,
  inventoryId,
  catalogId,
  variantId = null,
  variantTitle = null,
  tx = prisma,
) => {
  // pokud mame id vracime
  if (variantId) return variantId;
  console.log("21");
  // pokud nema id ale mame nezev, zkusi ho najit najit nebo vytvorit
  if (variantTitle) {
    const formattedTitle = formatTitleCase(variantTitle);
    console.log("22");

    // hledani varianty pouzite v tomto inventari
    const variantInInventory = await tx.food.findFirst({
      where: {
        inventoryId: inventoryId,
        catalogId: catalogId,
        variant: {
          title: formattedTitle,
        },
      },
      select: { variantId: true },
    });

    if (variantInInventory?.variantId) {
      console.log("23");

      return variantInInventory.variantId;
    }

    // hledani varinty daneho uzivatele
    const userVariant = await tx.foodVariant.findFirst({
      where: {
        foodCatalogId: catalogId,
        addedBy: userId,
        title: formattedTitle,
      },
    });

    if (userVariant) {
      console.log("24");

      if (userVariant.isDeleted) {
        console.log("25");

        await tx.foodVariant.update({
          where: { id: userVariant.id },
          data: { isDeleted: false },
        });
      }
      return userVariant.id;
    }
    console.log("26");

    // vytvoreni nove varianty
    const newVariant = await tx.foodVariant.create({
      data: {
        title: formattedTitle,
        foodCatalogId: catalogId,
        addedBy: userId,
      },
    });
    return newVariant.id;
  }
  return null;
};

//Provede soft-delete varianty, pokud neni vazana na zadne jidlo s existujicimi instancemi
export const softDeleteOrphanedVariantRepository = async (variantId, tx = prisma) => {
  if (!variantId) return null;

  try {
    const result = await tx.foodVariant.updateMany({
      where: {
        id: variantId,
        isDeleted: false,
        NOT: {
          foods: {
            some: {
              instances: {
                some: {},
              },
            },
          },
        },
      },
      data: {
        isDeleted: true,
      },
    });
    return result;
  } catch (error) {
    console.error(`Error failed cleanup variant ${variantId}:`, error);
    throw error;
  }
};

//vyhleda existujici entitu Food pro MERGE, nebo zajisti/vytvori Variant a nove Food
export const resolveTargetFoodEntityRepository = async (params, tx = prisma) => {
  const { foodId, inventoryId, catalogId, userId, variantData, defaultLabelId, categoryId } = params;

  let targetFood = null;
  let targetVariant = null;

  const targetId = variantData?.new?.variantId;
  const targetTitle = formatTitleCase(variantData.new.variantTitle);

  // hledame, zda cilove Food už v inventari existuje (MERGE)
  targetFood = await tx.food.findFirst({
    where: {
      NOT: { id: foodId },
      inventoryId: inventoryId,
      catalogId: catalogId,
      OR: [
        ...(targetId !== undefined ? [{ variantId: targetId }] : []),
        ...(targetId === undefined && targetTitle ? [{ variant: { title: targetTitle } }] : []),
      ],
    },
    include: { variant: true },
  });

  if (targetFood) {
    console.log("1.2");
    if (targetFood?.variant?.isDeleted) {
      await recoverFoodVariantRepository(targetFood?.variant?.id, tx);
    }
    console.log(targetFood);
    return {
      foodId: targetFood.id,
      variantId: targetFood.variantId,
      variantTitle: targetFood?.variant?.title,
      action: "MERGE",
    };
  }

  // pokud MERGE neprosel, musime zajistit/vytvorit variantu
  if (targetId) {
    console.log("1.3");

    // pokud mame id pak uz nehledame
    targetVariant = await tx.foodVariant.findUnique({
      where: { id: targetId },
    });
  } else if (targetTitle) {
    console.log("1.4");

    // jinak hledani varinty daneho uzivatele
    targetVariant = await tx.foodVariant.findFirst({
      where: {
        foodCatalogId: catalogId,
        addedBy: userId,
        title: targetTitle,
      },
    });

    if (!targetVariant) {
      console.log("1.5");

      //pokud neexistuje vytvorime
      targetVariant = await tx.foodVariant.create({
        data: {
          title: targetTitle,
          foodCatalogId: catalogId,
          addedBy: userId,
        },
      });
    }
  }
  console.log("1.7");

  //ozivime variantu pokud byla uz smazana
  if (targetVariant?.isDeleted) {
    console.log("1.6");
    await recoverFoodVariantRepository(targetVariant.id, tx);
  }

  // vytvoreni noveho zaznamu food (protoze MERGE nebyl mozny)
  const newFood = await tx.food.create({
    data: {
      inventoryId: inventoryId,
      categoryId: categoryId,
      catalogId: catalogId,
      variantId: targetVariant?.id ?? null,
      defaultLabelId: defaultLabelId,
      minimalQuantity: 0,
    },
  });

  return {
    foodId: newFood.id,
    variantId: newFood?.variantId,
    variantTitle: targetVariant?.title,
    action: "UPDATE",
  };
};

// Obnovi smazanou variantu (recovery)
export const recoverFoodVariantRepository = async (variantId, tx = prisma) => {
  if (!variantId) return null;
  try {
    return await tx.foodVariant.update({
      where: { id: variantId },
      data: { isDeleted: false },
    });
  } catch (error) {
    console.error(`Failed to recover variant ${variantId}:`, error);
    throw error;
  }
};
