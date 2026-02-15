import { getHistoryRepository } from "../repositories/foodHistoryRepository.js";
import { getFoodInventoryUserRepository } from "../repositories/foodInventoryRepository.js";
import { getPricesMapFromHistoryRepository } from "../repositories/priceRepository.js";
import { convertPrice, createBaseCurrency } from "./priceService.js";

// vraci historii
export const getHistoryService = async (inventoryId, data, userId, isAdmin) => {
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }

  //zmena limitu pro pripad bulk zaznamu
  const desiredLimit = data.limit || 40;
  const dbLimit = Math.min(desiredLimit * 5, 200);

  const historyRaw = await getHistoryRepository(inventoryId, userId, { ...data, limit: dbLimit });

  //mena uzivatele
  const currency = await createBaseCurrency(userId, null);

  // ziska vsechny price z history
  const pricesMap = await getPricesMapFromHistoryRepository(historyRaw);

  const groupedHistory = [];
  let currentBatch = null;
  let currentBatchKey = null;
  const logTracker = [];

  // transformace a seskupovani
  for (const log of historyRaw) {
    let { batchItem, ...cleanMetadata } = log.metadata || {};
    const meta = log.metadata || {};

    let convertedOldPrice = 0;
    let convertedNewPrice = 0;

    //vypocet cen z metadat
    if (meta.price) {
      const oldPriceData = meta.price?.before ? pricesMap.get(meta.price.before) : null;
      const newPriceData = meta.price?.after ? pricesMap.get(meta.price.after) : null;

      convertedOldPrice = oldPriceData
        ? convertPrice(
            oldPriceData?.price,
            oldPriceData?.exchangeRate,
            oldPriceData?.exchangeAmount,
            oldPriceData?.baseCurrency,
            currency,
          )
        : 0;

      convertedNewPrice = newPriceData
        ? convertPrice(
            newPriceData?.price,
            newPriceData?.exchangeRate,
            newPriceData?.exchangeAmount,
            newPriceData?.baseCurrency,
            currency,
          )
        : 0;

      //prepsani id price na konkretni castky
      if (cleanMetadata.price) {
        cleanMetadata = {
          ...cleanMetadata,
          price: {
            after: Number(convertedNewPrice.toFixed(2)),
            before: Number(convertedOldPrice.toFixed(2)),
          },
        };
      }
    }

    //unikatni klic pro identicke zaznami
    const changeContext = [
      meta.variant ? `v:${meta.variant.before}-${meta.variant.after}` : "",
      meta.price ? `p:${convertedOldPrice}-${convertedNewPrice}` : "",
      meta.amount ? `a:${meta.amount.before}-${meta.amount.after}` : "",
      meta.unit ? `u:${meta.unit.before}-${meta.unit.after}` : "",
      meta.expirationDate ? `e:${meta.expirationDate.before}-${meta.expirationDate.after}` : "",
      meta.fullConsumption ? `fc:${meta.fullConsumption}` : "",
      meta.duplicatedFrom ? `orig:${meta.duplicatedFrom}` : "",
    ]
      .filter(Boolean)
      .join("|");

    const batchKey = `${log?.action}_${log?.changedBy}_${log.foodId || "no-food"}_${log.catalogId || "no-cat"}_${changeContext}`;

    const logTime = new Date(log.changedAt).getTime();
    let wasAddedToBatch = false;

    //prepocet ceny hlavni ceny
    const convertedPrice = log.price
      ? convertPrice(
          log?.price?.price,
          log?.price?.exchangeRate,
          log?.price?.exchangeAmount,
          log?.price?.baseCurrency,
          currency,
        )
      : 0;

    // pokus o pridani do skupiny stejnych zaznamu
    if (batchItem && currentBatch && currentBatchKey === batchKey) {
      const lastBatchTime = new Date(currentBatch.changedAt).getTime();
      const isWithinTimeWindow = Math.abs(lastBatchTime - logTime) < 5000;

      if (isWithinTimeWindow) {
        currentBatch.id = log.id;
        currentBatch.batchPrice += convertedPrice;
        currentBatch.itemsCount += 1;
        currentBatch.snapshotAmount += log.snapshotAmount || 0;
        currentBatch.quantityBefore = log.quantityBefore;
        currentBatch.isBatch = true;
        wasAddedToBatch = true;

        logTracker[logTracker.length - 1].lastLogId = log.id;
      }
    }

    // pokud nebylo pridano do skupiny vytvorime novy zaznam
    if (!wasAddedToBatch) {
      const userLabel = log.catalog?.labels?.[0];
      const globalLabel = log.food?.label;
      const activeLabel = userLabel || globalLabel;

      const name = log?.user?.name;
      const surname = log?.user?.surname;
      const user = name && surname ? `${name} ${surname}` : log?.user?.username;

      currentBatch = {
        id: log.id,
        action: log.action,
        title: activeLabel?.title || "unknow",
        variant: log?.food?.variant?.title || null,
        barcode: log?.catalog?.barcode || null,
        user: user || null,
        price: Number(convertedPrice?.toFixed(2)) || 0,
        batchPrice: convertedPrice || 0,
        currency: currency,
        currentAmount: log?.instance?.amount,
        currentUnit: log?.instance?.unit,
        snapshotUnit: log.snapshotUnit,
        snapshotAmount: log.snapshotAmount || 0,
        quantityBefore: log.quantityBefore,
        quantityAfter: log.quantityAfter,
        changedAt: log.changedAt,
        changedBy: log.changedBy,
        metadata: cleanMetadata,
        itemsCount: 1,
        isBatch: false,
      };

      currentBatchKey = batchKey;
      groupedHistory.push(currentBatch);
      logTracker.push({ lastLogId: log.id });
    }
  }

  // pokud se zaznamy seskupili vic nez uzivatel chte orizneme to na desiredLimit + mala rezerva (5)
  const finalLimit = desiredLimit + 5;
  const slicedHistory = groupedHistory.slice(0, finalLimit);

  // vezmeme id posledni zobrazene historie pro cursor
  const lastTrackedIndex = slicedHistory.length - 1;
  const nextCursor = lastTrackedIndex >= 0 ? logTracker[lastTrackedIndex].lastLogId : null;

  // finalni formatovani cen
  const items = slicedHistory.map((item) => {
    const hasPrice = item.batchPrice > 0;
    return {
      ...item,
      price: hasPrice ? Number(item.price.toFixed(2)) : null,
      batchPrice: hasPrice ? Number(item.batchPrice.toFixed(2)) : null,
      currency: hasPrice ? item.currency : null,
    };
  });

  return {
    items,
    nextCursor,
  };
};
