import { BadRequestError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { formatTitleCase } from "../utils/stringUtils.js";
import { getOrCreateFoodVariant } from "./foodVariantRepository.js";
import { createPriceRepository } from "./priceRepository.js";

// prida jidlo do inventare a vytvori instanci, price i history, pokd neexistuje tak i catalog, label, variant
export const addFoodToInventoryRepository = async (userId, data) => {
  const { quantity, ...rest } = data;
  const count = parseInt(quantity) || 1;
  try {
    return await prisma.$transaction(async (tx) => {
      let catalogId = null;
      let newCatalogCreate = false;
      let isCatalogUse = false;
      let userOwnsCatalog = false;
      //pokud barcode je "" a nemame catalogId pak je to potravina bez barcodu,
      // tedy se vytvori novy katalog
      if (!data?.catalogId) {
        if (data?.barcode === "") {
          console.log("1");
          const createdCatalog = await tx.foodCatalog.create({
            data: {
              barcode: null,
              addedBy: userId,
            },
          });
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
            const created = await tx.foodCatalog.create({
              data: { barcode: data?.barcode, addedBy: userId },
            });
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
        //najde jestli se catalog pouziva uz v inventari
        isCatalogUse = await tx.food.findFirst({
          where: {
            inventoryId: data.inventoryId,
            catalogId: catalogId,
          },
        });
        userOwnsCatalog = catalog?.addedBy === userId;
      }

      if ((newCatalogCreate || !isCatalogUse || userOwnsCatalog) && !data?.title) {
        throw new BadRequestError("Title must exist.");
      }

      //najdem uzivateluv label pokud jiz existuje
      const userLabel = await tx.foodLabel.findFirst({
        where: {
          userId,
          catalogId,
        },
      });

      //rozhodujeme jestli vytvorit label
      let needsLabelUpdate = newCatalogCreate || !isCatalogUse;
      const labelFields = ["title", "description", "foodImageUrl", "price", "amount", "unit"];

      let finalLabelId = userLabel?.id || null;
      //vraci true pokud se label od pouzivaneho nejak lisi
      if (userLabel) {
        console.log("6");

        needsLabelUpdate = labelFields.some(
          (key) => data[key] !== undefined && data[key] !== userLabel[key],
        );
      } else {
        console.log("7");

        //kontrola jestli je potreba label vubec vytvaret
        const originalLabel = isCatalogUse?.defaultLabelId
          ? await tx.foodLabel.findUnique({
              where: { id: isCatalogUse.defaultLabelId },
            })
          : null;

        needsLabelUpdate =
          !originalLabel ||
          labelFields.some((key) => data[key] !== undefined && data[key] !== originalLabel[key]);

        if (!needsLabelUpdate) {
          console.log("8");

          finalLabelId = originalLabel.id;
        }
      }

      //pokud je needsLabelUpdate true pak updatuje label pokud existuje jinak ho vytvori
      if (needsLabelUpdate) {
        console.log("9");

        const labelPayload = {
          title: formatTitleCase(data?.title),
          description: data?.description ?? undefined,
          foodImageUrl: data?.foodImageUrl ?? undefined,
          price: data?.price ?? undefined,
          amount: data?.amount ?? undefined,
          unit: data?.unit ?? undefined,
          isDeleted: false,
        };

        if (userLabel) {
          console.log("10");

          const updated = await tx.foodLabel.update({
            where: { id: userLabel.id },
            data: labelPayload,
          });
          finalLabelId = updated.id;
        } else {
          console.log("11");

          const created = await tx.foodLabel.create({
            data: {
              userId: userId,
              catalogId: catalogId,
              ...labelPayload,
            },
          });
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
      const currentCountInstances = await tx.foodInstance.count({
        where: { foodId: food.id },
      });

      //pokud je vice instanci
      const batchItem = count > 1 ? {} : { batchItem: true };

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
    });
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
        throw new NotFoundError(`Food with ID ${foodId} was not found.`);
      }
      return null;
    }
    return foodWithVariant.variant;
  } catch (error) {
    console.error(`Error fetching variant for foodId ${foodId}:`, error);
    throw error;
  }
};

