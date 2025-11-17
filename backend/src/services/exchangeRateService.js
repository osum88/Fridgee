import axios from "axios";
import { createExchangeRateRepository, deleteExchangeRateRepository, getExchangeRateRepository, updateExchangeRateRepository } from "../repositories/exchangeRateRepository.js";

//vraci kurz eura ze CNB API
export const getEuroRate = async () => {
    const response = await axios.get("https://api.cnb.cz/cnbapi/exrates/daily");
    const rates = response.data.rates;
    const euro = rates.find(rate => rate.currencyCode === "EUR");

    if(!euro) {
        throw new Error("Failed to fetch Euro exchange rate"); 
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
    const updatedExchangeRate = await updateExchangeRateRepository(currencyCode, convertedCurrencyCode, updates);
    return updatedExchangeRate;   
};

// smaze exchange rate 
export const deleteExchangeRateService = async (currencyCode, convertedCurrencyCode) => {
    if (!currencyCode || !convertedCurrencyCode) {
        throw new Error("Currency codes must be provided");
    }
    const deletedExchangeRate = await deleteExchangeRateRepository(currencyCode, convertedCurrencyCode);
    return deletedExchangeRate;
}

// vratí exchange rate 
export const getExchangeRateService = async (currencyCode, convertedCurrencyCode) => {
    if (!currencyCode || !convertedCurrencyCode) {
        throw new Error("Currency codes must be provided");
    }
    const exchangeRate = await getExchangeRateRepository(currencyCode, convertedCurrencyCode);
    return exchangeRate;
};


