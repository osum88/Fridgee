import prisma from "../utils/prisma.js";

// vytvoru novy exchange rate
export const createExchangeRateRepository = async (data) => {
  try {
    return await prisma.exchangeRate.create({
      data,
    });
  } catch (error) {
    console.error("Error creating exchange rate:", error);
    throw error;
  }
};

// update exchange rate podle currencyCode a convertedCurrencyCode
export const updateExchangeRateRepository = async (
  currencyCode,
  convertedCurrencyCode,
  updates,
) => {
  try {
    return await prisma.exchangeRate.update({
      where: {
        currencyCode_convertedCurrencyCode: {
          currencyCode,
          convertedCurrencyCode,
        },
      },
      data: updates,
    });
  } catch (error) {
    console.error("Error updating exchange rate:", error);
    throw error;
  }
};

// smaze exchange rate
export const deleteExchangeRateRepository = async (currencyCode, convertedCurrencyCode) => {
  try {
    return await prisma.exchangeRate.delete({
      where: {
        currencyCode_convertedCurrencyCode: {
          currencyCode,
          convertedCurrencyCode,
        },
      },
    });
  } catch (error) {
    console.error("Error deleting exchange rate:", error);
    throw error;
  }
};

// vratí exchange rate
export const getExchangeRateRepository = async (currencyCode, convertedCurrencyCode) => {
  try {
    return await prisma.exchangeRate.findUnique({
      where: {
        currencyCode_convertedCurrencyCode: {
          currencyCode,
          convertedCurrencyCode,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching exchange rate:", error);
    throw error;
  }
};
