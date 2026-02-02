import { BadRequestError, NotFoundError } from "../errors/errors.js";
import { getExchangeRateRepository } from "../repositories/exchangeRateRepository.js";
import { createPriceRepository, deletePriceRepository, getPriceByIdRepository, updatePriceRepository } from "../repositories/priceRepository.js";
import { getUserCountryByIdRepository } from "../repositories/userRepository.js";

// rozhodne o zakladni mene podle uzivatele
const createBaseCurrency = async (userId) => {
    const country = await getUserCountryByIdRepository(userId);
    switch (country) {
        case "CZ":
            return "CZK";
        case "SK":
            return "EUR";
        case "OTHER":
            return "EUR";
        default:
            return "CZK";
    }
}

// vytvori data pro novou price
export const createPriceDataService = async (price, currency, userId) => {
    if (!price) {
        throw new BadRequestError("Price must be provided");
    }   
    const baseCurrency =
        currency && currency !== "" ? currency : await createBaseCurrency(userId);

    const currentRate = await getExchangeRateRepository("EUR", "CZK");
    if (!currentRate) {
        throw new NotFoundError("Exchange rate not found");
    }
    const exchangeAmount = { "EURCZK": currentRate.amount };
    const exchangeRate = { "EURCZK": currentRate.rate };

    return {
        price,
        baseCurrency,
        exchangeAmount,
        exchangeRate,
        exchangeRateDate: currentRate.exchangeRateDate,
    };
};

// updatuje price
export const updatePriceService = async (id, price, baseCurrency) => {
    const data = {};

    if (price && price !== "") {
        data.price = price;
    }
    if (baseCurrency && baseCurrency !== "") {
        data.baseCurrency = baseCurrency;
    }

    if (Object.keys(data).length === 0) {
        throw new BadRequestError("No valid fields provided for update");
    }
    const updatedPrice = await updatePriceRepository(id, data);
    return updatedPrice;
};

const convertPrice = (price, rate, amount, baseCurrency, currency) => {
    if (!price || !rate || !amount || !baseCurrency || !currency) {
        return null;
    }
    // oba klice            
    const forwardKey = `${baseCurrency}${currency}`;
    const reverseKey = `${currency}${baseCurrency}`;

    // forwardKey
    if (rate[forwardKey] !== undefined) {
        return price * (rate[forwardKey] / amount[forwardKey]);
    }
      
    // reverseKey
    if (rate[reverseKey] !== undefined) {
        return price * (amount[reverseKey] / rate[reverseKey]);
    }
    return null;
}

//vrati price
export const getPriceByIdService = async (priceId, currency, userId) => {
    const priceDb = await getPriceByIdRepository(priceId);

    const baseCurrency = currency && currency !== "" ? currency : await createBaseCurrency(userId);

    let newPrice = priceDb.price;
    if (baseCurrency && baseCurrency !== priceDb.baseCurrency){
        newPrice = convertPrice(priceDb.price, priceDb.exchangeRate, priceDb.exchangeAmount, priceDb.baseCurrency, baseCurrency);
    }
    return { price: newPrice, currency: baseCurrency };
};

// smaze price
export const deletePriceService = async (id) => {
    const deletedPrice = await deletePriceRepository(id);
    return deletedPrice;
};

