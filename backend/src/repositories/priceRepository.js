import { NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";

// vytvori novou cenu
export const createPriceRepository = async (data, tx = prisma) => {
  try {
    if (!data?.price || data.price <= 0) {
      return null;
    }
    return await tx.price.create({
      data: {
        price: data.price,
        baseCurrency: data?.baseCurrency || "CZK",
        exchangeAmount: data?.exchangeAmount,
        exchangeRate: data?.exchangeRate,
        exchangeRateDate: data?.exchangeRateDate,
      },
    });
  } catch (error) {
    console.error("Error creating price:", error);
    throw error;
  }
};

// nacte cenu podle id
export const getPriceByIdRepository = async (id) => {
  try {
    const price = await prisma.price.findUnique({
      where: { id },
    });
    if (!price) {
      throw new NotFoundError("Price not found.");
    }
    return price;
  } catch (error) {
    console.error("Error fetching price:", error);
    throw error;
  }
};

//vraci id price podle dat
export const findOrCreatePriceIdRepository = async (priceData,  tx) => {
    const existingPrice = await tx.price.findFirst({
    where: {
      price: priceData.price,
      baseCurrency: priceData.baseCurrency,
      exchangeRate: {
        equals: priceData.exchangeRate,
      },
      exchangeAmount: {
        equals: priceData.exchangeAmount,
      },
      exchangeRateDate: priceData.exchangeRateDate,
    },
    select: { id: true },
  });

  if (existingPrice) {
    return existingPrice.id;
  } else {
    const newPrice = await tx.price.create({ data: priceData });
    return newPrice.id;
  }
};

//smaze vsechny nepouzivane ceny
export const deleteUnusedPricesRepository = async (tx = prisma) => {
  try {
    // najde id vsech cen ktere se aktualne pouzivaji v instancich
    const usedInInstances = await tx.foodInstance.findMany({
      where: { priceId: { not: null } },
      select: { priceId: true },
    });

    // najde id vsech cen ktere se aktualne pouzivaji v historii
    const usedInHistoryDirect = await tx.foodHistory.findMany({
      where: { priceId: { not: null } },
      select: { priceId: true },
    });

    // najde id vsech cen ktere se aktualne pouzivaji v metadatech historie
    const usedInMetadataRaw =
      (await tx.$queryRaw`
        SELECT DISTINCT (metadata->'price'->>'after')::int as id FROM food_histories WHERE metadata->'price'->>'after' IS NOT NULL
        UNION
        SELECT DISTINCT (metadata->'price'->>'before')::int as id FROM food_histories WHERE metadata->'price'->>'before' IS NOT NULL
      `) || [];

    // sjednoti vsechny id
    const allUsedIdsList = [
      ...usedInInstances.map((i) => i.priceId),
      ...usedInHistoryDirect.map((h) => h.priceId),
      ...usedInMetadataRaw.map((m) => Number(m.id)).filter((id) => id !== null && !isNaN(id)),
    ];

    const allUsedIds = new Set(allUsedIdsList);

    //pokud zadna cena neni pouzita smaze vse
    if (allUsedIds.size === 0) {
      const result = await tx.price.deleteMany({});
      return result.count;
    }

    // smaze vsechny nepouzivane price
    return await tx.price.deleteMany({
      where: {
        id: {
          notIn: Array.from(allUsedIds),
        },
      },
    });
  } catch (error) {
    console.error("Error in deleteUnusedPricesRepository:", error);
    throw error;
  }
};

// ziska vsechny price z history
export const getPricesMapFromHistoryRepository = async (historyRaw) => {
  try {
    const priceIds = new Set();
    const pricesMap = new Map();

    historyRaw.forEach((log) => {
      if (log.metadata?.price?.before) priceIds.add(log.metadata.price.before);
      if (log.metadata?.price?.after) priceIds.add(log.metadata.price.after);
    });

    if (priceIds.size > 0) {
      const prices = await prisma.price.findMany({
        where: { id: { in: Array.from(priceIds) } },
        select: {
          id: true,
          price: true,
          baseCurrency: true,
          exchangeAmount: true,
          exchangeRate: true,
        },
      });
      prices.forEach((p) => pricesMap.set(p.id, p));
    }

    return pricesMap;
  } catch (error) {
    console.error("Error fetching prices map for history:", error);
    return new Map();
  }
};
