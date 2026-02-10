import { deleteUnusedPricesRepository } from "../repositories/priceRepository.js";
import prisma from "../utils/prisma.js";

//maze historii starsi nez rok a uklidi jiz nepotrebna data (food, variant, price, catalog, label)
export const cleanupInventoryData = async () => {
  try {
    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

    return await prisma.$transaction(
      async (tx) => {
        //smaze zaznamy v historii starsi nez rok
        const deletedHistories = await tx.foodHistory.deleteMany({
          where: { changedAt: { lt: oneYearAgo } },
        });

        //smaze vsechny nepouzivane ceny
        const deletedPrices = await deleteUnusedPricesRepository(tx);

        //smaze jidlo ktere se nepouziva v historii nebo nema instanci
        const deletedFoods = await tx.food.deleteMany({
          where: {
            NOT: {
              OR: [{ instances: { some: {} } }, { history: { some: {} } }],
            },
          },
        });

        //smaze varianty ktere se nepouzivaji v zadnem jidle
        const deletedVariants = await tx.foodVariant.deleteMany({
          where: {
            NOT: { foods: { some: {} } },
          },
        });

        //smaze soft deleted labely ktere se nepouzivaji v zadnem jidle
        const deletedLabels = await tx.foodLabel.deleteMany({
          where: {
            isDeleted: true,
            NOT: { foods: { some: {} } },
          },
        });

        //smaze soft deleted catalogy bez barcodu ktere se nepouzivaji v zadnem jidle
        const deletedCatalogs = await tx.foodCatalog.deleteMany({
          where: {
            barcode: null,
            NOT: {
              OR: [{ foods: { some: {} } }, { foodHistories: { some: {} } }],
            },
          },
        });

        console.log(`
--- INVENTORY DATA CLEANUP COMPLETE ---
 Histories: ${deletedHistories.count}
 Prices:    ${deletedPrices.count}
 Foods:     ${deletedFoods.count}
 Variants:  ${deletedVariants.count}
 Labels:    ${deletedLabels.count}
 Catalogs:  ${deletedCatalogs.count}
---------------------------------------
        `);
        return {
          histories: deletedHistories.count,
          prices: deletedPrices.count,
          foods: deletedFoods.count,
          variants: deletedVariants.count,
          labels: deletedLabels.count,
          catalogs: deletedCatalogs.count,
        };
      },
      {
        timeout: 20000,
      },
    );
  } catch (error) {
    console.error("Error during inventory data cleanup:", error);
    throw error;
  }
};
