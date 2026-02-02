import axios from "axios";
import {
  createExchangeRateRepository,
  deleteExchangeRateRepository,
  getExchangeRateRepository,
  updateExchangeRateRepository,
} from "../repositories/exchangeRateRepository.js";
import { formatToISODate } from "../utils/stringUtils.js";
import { NotFoundError } from "../errors/errors.js";

/**
 * Získá kurz eura z API ČNB pro konkrétní datum nebo aktuální den.
 * @param {string|Date|null} date - Datum, pro které se má kurz vyhledat (YYYY-MM-DD).
 * @returns {Promise<Object>|null} Objekt s informacemi o kurzu eura vůči CZK nebo null pokud API selhalo, pro konkrétní den.
 * @throws {NotFoundError} Pokud se nepodaří získat kurz nebo data z API.
 */
export const getEuroRate = async (date = null) => {
  let iso = formatToISODate(date);
  const url = iso
    ? `https://api.cnb.cz/cnbapi/exrates/daily?date=${iso}`
    : "https://api.cnb.cz/cnbapi/exrates/daily";

  const response = await axios.get(url);
  const rates = response.data.rates;
  const euro = rates.find((rate) => rate.currencyCode === "EUR");

  //Pokud euro neni a nemame datum (selhalo aktualni API)
  if (!euro && !iso) {
    throw new NotFoundError("Failed to fetch current Euro exchange rate from CNB");
  }
  // pokud euro neni pro dane datum, zkusime aktualni (REKURZE)
  if (!euro && iso) {
    console.log(`Rate for ${iso} not found, fetching current rate instead.`);
    return null
  }
  const data = {
    amount: euro.amount,
    country: euro.country,
    currencyCode: euro.currencyCode,
    convertedCurrencyCode: "CZK",
    rate: euro.rate,
    exchangeRateDate: new Date(euro.validFor),
  };
  return data;
};

// vytvori novy exchange rate
export const createExchangeRateService = async (data) => {
  const newExchangeRate = await createExchangeRateRepository(data);
  return newExchangeRate;
};

// update exchange rate podle currencyCode a convertedCurrencyCode
export const updateExchangeRateService = async (currencyCode, convertedCurrencyCode, updates) => {
  if (!currencyCode || !convertedCurrencyCode) {
    throw new Error("Currency codes must be provided");
  }
  const updatedExchangeRate = await updateExchangeRateRepository(
    currencyCode,
    convertedCurrencyCode,
    updates,
  );
  return updatedExchangeRate;
};

// smaze exchange rate
export const deleteExchangeRateService = async (currencyCode, convertedCurrencyCode) => {
  if (!currencyCode || !convertedCurrencyCode) {
    throw new Error("Currency codes must be provided");
  }
  const deletedExchangeRate = await deleteExchangeRateRepository(
    currencyCode,
    convertedCurrencyCode,
  );
  return deletedExchangeRate;
};

// vratí exchange rate
export const getExchangeRateService = async (currencyCode, convertedCurrencyCode) => {
  if (!currencyCode || !convertedCurrencyCode) {
    throw new Error("Currency codes must be provided");
  }
  const exchangeRate = await getExchangeRateRepository(currencyCode, convertedCurrencyCode);
  return exchangeRate;
};
