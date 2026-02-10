import { getExchangeRateRepository } from "../repositories/exchangeRateRepository.js";
import {
  createExchangeRateService,
  getEuroRate,
  updateExchangeRateService,
} from "../services/exchangeRateService.js";

// denni akulizace kurzku eura czk
export const dailyUpdateExchangeRate = async () => {
  try {
    const euroRateData = await getEuroRate();
    const currentRate = await getExchangeRateRepository("EUR", "CZK");
    if (!currentRate) {
      await createExchangeRateService(euroRateData);
      console.log("Created new exchange rate for EUR to CZK.");
    } else if (
      new Date(currentRate.exchangeRateDate).getTime() !==
      new Date(euroRateData.exchangeRateDate).getTime()
    ) {
      await updateExchangeRateService("EUR", "CZK", {
        rate: euroRateData.rate,
        exchangeRateDate: euroRateData.exchangeRateDate,
        amount: euroRateData.amount,
        country: euroRateData.country,
      });
      console.log("Updated exchange rate for EUR to CZK.");
    } else {
      console.log("No update needed for EUR to CZK exchange rate.");
    }
  } catch (error) {
    console.error("Error during daily exchange rate update:", error);
    throw error;
  }
};
