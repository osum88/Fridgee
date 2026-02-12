import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { formatTitleCase } from "../utils/stringUtils.js";
import { createFoodCatalogRepository } from "./foodCatalogRepository.js";
import { moveFoodsToCategoryRepository } from "./foodCategoryRepository.js";
import { logLabelUpdateHistoryRepository } from "./foodHistoryRepository.js";
import {
  createFoodLabelRepository,
  updateFoodLabelRepository,
} from "./foodLabelRepository.js";
import {
  getOrCreateFoodVariant,
  resolveTargetFoodEntityRepository,
  softDeleteOrphanedVariantRepository,
} from "./foodVariantRepository.js";
import { createPriceRepository } from "./priceRepository.js";

// prida jidlo do inventare a vytvori instanci, price i history, pokd neexistuje tak i catalog, label, variant
export const addFoodToInventoryRepository = async (userId, data) => {
  const { quantity, ...rest } = data;
  const count = parseInt(quantity) || 1;
  try {
    return await prisma.$transaction(
      async (tx) => {
        let catalogId = null;
        let newCatalogCreate = false;
        let isCatalogUse = false;
        let userOwnsCatalog = false;
        //pokud barcode je "" a nemame catalogId pak je to potravina bez barcodu,
        // tedy se vytvori novy katalog
        if (!data?.catalogId) {
          if (data?.barcode === "") {
            console.log("1");
            const createdCatalog = await createFoodCatalogRepository(userId, null, tx);
            catalogId = createdCatalog.id;
            newCatalogCreate = true;
          }
          //pokud barcode existuje a nemame catalogId pak se najde jinak se vytvori
          else if (data?.barcode) {
            console.log("2");
            const existingCatalog = await tx.foodCatalog.findFirst({
              where: {
                barcode: data?.barcode,
              },
            });

            if (existingCatalog) {
              console.log("3");
              catalogId = existingCatalog.id;
            } else {
              const created = await createFoodCatalogRepository(userId, data?.barcode, tx);
              catalogId = created.id;
              newCatalogCreate = true;
            }
          }
        }
        //jinak musi catalogId existovat
        else {
          catalogId = data?.catalogId;
          console.log("4");

          //pokud je uzivatel jeho majitelem, tak pokud jiz na predtim nastavil na isDeleted, tak se obnovi
          const catalog = await tx.foodCatalog.findFirst({
            where: { id: catalogId, addedBy: userId },
          });
          if (catalog?.isDeleted) {
            console.log("5");

            await tx.foodCatalog.update({
              where: { id: catalogId },
              data: {
                isDeleted: false,
              },
            });
          }
          userOwnsCatalog = catalog?.addedBy === userId;
        }
        //najde jestli se catalog pouziva uz v inventari
        isCatalogUse = await tx.food.findFirst({
          where: {
            inventoryId: data.inventoryId,
            catalogId: catalogId,
          },
        });

        if ((newCatalogCreate || !isCatalogUse || userOwnsCatalog) && !data?.title) {
          throw new BadRequestError("Title must exist.");
        }

        //najdem uzivateluv label pokud jiz existuje
        const userLabel = await tx.foodLabel.findFirst({
          where: { userId, catalogId },
        });

        //rozhodujeme jestli vytvorit label
        let needsLabelUpdate = newCatalogCreate || !isCatalogUse;
        const labelFields = ["title", "description", "foodImageUrl", "price", "amount", "unit"];

        let finalLabelId = userLabel?.id || null;
        const originalLabel = isCatalogUse?.defaultLabelId
          ? await tx.foodLabel.findUnique({
              where: { id: isCatalogUse.defaultLabelId },
            })
          : null;

        //vraci true pokud se label od pouzivaneho nejak lisi
        if (userLabel) {
          console.log("6");

          needsLabelUpdate = labelFields.some(
            (key) => data[key] !== undefined && data[key] !== userLabel[key],
          );
        } else {
          console.log("7");

          needsLabelUpdate =
            !originalLabel ||
            labelFields.some((key) => data[key] !== undefined && data[key] !== originalLabel[key]);

          if (!needsLabelUpdate) {
            console.log("8");
            finalLabelId = originalLabel.id;
          }
        }

        //pokud autor defaultniho labelu zmenil nazev zapiseme to do historie
        let isOriginalOwnerLabelChangeTitle = null;

        //pokud je needsLabelUpdate true pak updatuje label pokud existuje jinak ho vytvori
        if (needsLabelUpdate) {
          console.log("9");

          const labelPayload = {
            title: data?.title,
            description: data?.description ?? undefined,
            foodImageUrl: data?.foodImageUrl ?? undefined,
            price: data?.price ?? undefined,
            amount: data?.amount ?? undefined,
            unit: data?.unit ?? undefined,
            isDeleted: false,
          };

          if (userLabel) {
            console.log("10");

            //pokud autor defaultniho labelu zmenil nazev zapiseme to do historie
            if (originalLabel?.userId === userId && originalLabel.title !== labelPayload?.title) {
              console.log("87");
              isOriginalOwnerLabelChangeTitle = {
                old: originalLabel.title,
                new: labelPayload?.title,
              };
            }

            // updatujeme label
            const updated = await updateFoodLabelRepository(userLabel.id, labelPayload, tx);
            finalLabelId = updated.id;
          } else {
            console.log("11");

            const created = await createFoodLabelRepository(
              {
                userId: userId,
                catalogId: catalogId,
                ...labelPayload,
              },
              tx,
            );
            finalLabelId = created.id;
          }
        }

        //pokud varintaid existuje pak se pouzije, jinak se hleda podle title, jinak se vytvori
        const variantId = await getOrCreateFoodVariant(
          userId,
          data.inventoryId,
          catalogId,
          data?.variantId,
          data?.variantTitle,
          tx,
        );

        //najde food
        let food = await tx.food.findFirst({
          where: {
            inventoryId: data.inventoryId,
            catalogId: catalogId,
            variantId: variantId || null,
          },
        });

        if (!food) {
          console.log("14");

          food = await tx.food.create({
            data: {
              inventoryId: data.inventoryId,
              catalogId: catalogId,
              variantId: variantId || null,
              categoryId: data?.categoryId || null,
              defaultLabelId: finalLabelId,
              minimalQuantity: data.minimalQuantity || 0,
            },
          });
        }

        // vytvori novou cenu
        const priceRecord = await createPriceRepository(data, tx);
        const newPriceId = priceRecord ? priceRecord.id : null;

        // zamkne food radek pro ostatni zapisy dokud neskonci transakce
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${food.id} FOR UPDATE`;

        //vrati pocet instanci foodu v inventari
        const currentCountInstances = await getFoodInstancesCountRepository(food.id, tx);

        //pokud autor defaultniho labelu zmenil nazev zapiseme to do historie
        if (isOriginalOwnerLabelChangeTitle) {
          await tx.foodHistory.create({
            data: {
              inventoryId: data.inventoryId,
              catalogId: catalogId,
              foodId: food.id,
              action: "LABEL_UPDATE",
              changedBy: userId,
              quantityBefore: currentCountInstances,
              quantityAfter: currentCountInstances,
              metadata: {
                foodLabel: {
                  before: isOriginalOwnerLabelChangeTitle?.old || null,
                  after: isOriginalOwnerLabelChangeTitle?.new || null,
                },
              },
            },
          });
        }

        //pokud je vice instanci
        const batchItem = count > 1 ? { batchItem: true } : {};

        // vytvori konkretni instanci/e v lednici
        const instances = [];
        for (let i = 0; i < count; i++) {
          const newInstance = await tx.foodInstance.create({
            data: {
              foodId: food.id,
              priceId: newPriceId,
              expirationDate: data?.expirationDate,
              addedBy: userId,
              amount: data?.amount,
              unit: data?.unit,
            },
          });
          instances.push(newInstance);

          // zaznamena akci do historie
          await tx.foodHistory.create({
            data: {
              inventoryId: data.inventoryId,
              catalogId: catalogId,
              foodId: food.id,
              foodInstanceId: newInstance.id,
              priceId: newPriceId,
              action: "ADD",
              changedBy: userId,
              snapshotAmount: data?.amount,
              snapshotUnit: data?.unit,
              quantityBefore: currentCountInstances + i,
              quantityAfter: currentCountInstances + i + 1,
              metadata: batchItem,
            },
          });
        }

        return instances;
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error("Error adding food to inventory:", error);
    throw error;
  }
};

// vraci variantu podle id food
export const getVariantByFoodIdRepository = async (foodId, throwError = true) => {
  try {
    const foodWithVariant = await prisma.food.findUnique({
      where: { id: foodId },
      select: {
        variant: true,
      },
    });
    if (!foodWithVariant) {
      if (throwError) {
        throw new NotFoundError(`Food was not found.`);
      }
      return null;
    }
    return foodWithVariant.variant;
  } catch (error) {
    console.error(`Error fetching variant for foodId ${foodId}:`, error);
    throw error;
  }
};

// vraci kategorii s food podle id food
export const getCategoryAndFoodByIdRepository = async (foodId, throwError = true) => {
  try {
    const foodWithCategory = await prisma.food.findUnique({
      where: { id: foodId },
      include: {
        category: true,
      },
    });

    if (!foodWithCategory) {
      if (throwError) {
        throw new NotFoundError(`Food was not found.`);
      }
      return null;
    }
    return {
      food: foodWithCategory,
      category: foodWithCategory.category,
    };
  } catch (error) {
    console.error(`Error fetching food and category for foodId ${foodId}:`, error);
    throw error;
  }
};

// Vrátí čistá data o potravině bez relací
export const getFoodByIdRepository = async (foodId, throwError = true) => {
  try {
    const food = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!food) {
      if (throwError) {
        throw new NotFoundError(`Food was not found.`);
      }
      return null;
    }
    return food;
  } catch (error) {
    console.error(`Error fetching food for foodId ${foodId}:`, error);
    throw error;
  }
};

export const updateFoodRepository = async (
  foodId,
  userId,
  variantData,
  categoryData,
  labelData,
  minimalQuantityData,
) => {
  try {
    return await prisma.$transaction(
      async (tx) => {
        const food = await tx.food.findUnique({
          where: { id: foodId },
        });
        const historiesData = [];
        let currentFoodId = foodId;
        let newVariant = null;

        // zamkne food radek pro ostatni zapisy dokud neskonci transakce
        await tx.$executeRaw`SELECT id FROM foods WHERE id = ${foodId} FOR UPDATE`;

        //vrati pocet instanci foodu v inventari
        const currentCount = await getFoodInstancesCountRepository(foodId, tx);

        // zmena varianty
        if (variantData) {
          console.log("1");
          newVariant = await resolveTargetFoodEntityRepository(
            {
              foodId,
              inventoryId: food.inventoryId,
              catalogId: food.catalogId,
              userId,
              variantData,
              defaultLabelId: food?.defaultLabelId,
              categoryId: food?.categoryId,
              minimalQuantity: minimalQuantityData?.minimalQuantity ?? food?.minimalQuantity,
            },
            tx,
          );

          const oldFoodId = currentFoodId;
          currentFoodId = newVariant?.foodId;

          //pokud se foodId zmenou varianty zmenilo pak aktulizuje vsechny jeho puvodni instance
          if (currentFoodId !== oldFoodId) {
            console.log("2");

            await tx.foodInstance.updateMany({
              where: { foodId: oldFoodId },
              data: { foodId: currentFoodId },
            });
            // zamkne food radek pro ostatni zapisy dokud neskonci transakce
            await tx.$executeRaw`SELECT id FROM foods WHERE id = ${currentFoodId} FOR UPDATE`;
          }

          //data do historie o zmene varianty
          historiesData.push({
            inventoryId: food.inventoryId,
            foodId: currentFoodId,
            catalogId: food.catalogId,
            action: newVariant?.action,
            changedBy: userId,
            metadata: {
              variant: {
                before: variantData?.old?.variantTitle || null,
                after: newVariant?.variantTitle || null,
              },
            },
          });
        }

        //zmena kategorie
        if (categoryData) {
          console.log("3");

          const categoryResult = await moveFoodsToCategoryRepository(
            food.inventoryId,
            currentFoodId === foodId ? foodId : [currentFoodId, foodId],
            categoryData?.new?.categoryId,
            categoryData?.new?.categoryTitle,
            categoryData?.old?.categoryId,
            tx,
          );
          if (categoryResult) {
            console.log("4");

            historiesData.push({
              inventoryId: food.inventoryId,
              foodId: currentFoodId,
              catalogId: food.catalogId,
              action: categoryResult?.action,
              changedBy: userId,
              metadata: {
                foodCategory: {
                  before: categoryData?.old?.categoryTitle || null,
                  after: categoryResult?.categoryTitle || null,
                },
              },
            });
          }
        }
        // zmena labelu
        if (labelData) {
          console.log("5");

          if (labelData?.id) {
            console.log("6");
            const updatedLabel = await updateFoodLabelRepository(
              labelData.id,
              { ...labelData.new, isDeleted: false },
              tx,
            );

            await logLabelUpdateHistoryRepository(
              updatedLabel.id,
              labelData?.old?.title,
              updatedLabel?.title,
              userId,
              tx,
            );
          } else {
            console.log("9");

            await createFoodLabelRepository(
              { ...labelData.new, catalogId: food.catalogId, userId: userId },
              tx,
            );
          }
        }

        // zmena minimalniho mnozstvi
        if (minimalQuantityData) {
          console.log("10");

          const updatedMinimalQuantity = await tx.food.update({
            where: { id: currentFoodId },
            data: { minimalQuantity: minimalQuantityData?.new?.minimalQuantity },
          });

          //kontrola ze se opravdu zmenila
          if (
            updatedMinimalQuantity.minimalQuantity !== minimalQuantityData?.old?.minimalQuantity
          ) {
            console.log("11");

            historiesData.push({
              inventoryId: food.inventoryId,
              foodId: currentFoodId,
              catalogId: food.catalogId,
              action: "MIN_QUANTITY_UPDATE",
              changedBy: userId,
              metadata: {
                minimalQuantity: {
                  before: minimalQuantityData?.old?.minimalQuantity,
                  after: updatedMinimalQuantity?.minimalQuantity,
                },
              },
            });
          }
        }

        //vrati novy pocet instanci foodu v inventari
        let newCount = currentCount;
        if (foodId !== currentFoodId) {
          console.log("12");

          newCount = await getFoodInstancesCountRepository(currentFoodId, tx);
        }

        if (historiesData.length > 0) {
          console.log("13");

          await tx.foodHistory.createMany({
            data: historiesData.map((h) => ({
              ...h,
              foodInstanceId: null,
              priceId: null,
              snapshotUnit: null,
              snapshotAmount: null,
              quantityBefore: currentCount,
              quantityAfter: newCount,
            })),
          });
        }

        //pokud se varianta zmenila uvolnime starou pokud neni potreba(SOFT DELETE)
        if (newVariant) {
          console.log("14");

          await softDeleteOrphanedVariantRepository(variantData?.old?.variantId, tx);
        }
        return { foodId: currentFoodId };
      },
      {
        timeout: 10000,
      },
    );
  } catch (error) {
    console.error(`Error updating food for foodId ${foodId}:`, error);
    throw error;
  }
};

// vrati pocet instanci pro food id
export const getFoodInstancesCountRepository = async (foodId, tx = prisma) => {
  try {
    return await tx.foodInstance.count({
      where: {
        foodId: foodId,
      },
    });
  } catch (error) {
    console.error(`Error counting food instances for foodId ${foodId}:`, error);
    throw error;
  }
};
