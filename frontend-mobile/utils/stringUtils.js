import i18n from "@/constants/translations";
import { Unit } from "@/constants/food";

// prevede date do DD.MM.YYYY
export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}.${month}.${year}`;
};

// prevede den, mesic, rok do date
export const editDate = (day, month, year) => {
  if (!day || !month || !year) return "";
  const now = new Date();
  const hours = now.getUTCHours();
  const minutes = now.getUTCMinutes();
  const seconds = now.getUTCSeconds();
  const milliseconds = now.getUTCMilliseconds();
  return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds));
};

// parsuje datum DD.MM.YYYY do date
export const parseDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const [day, month, year] = dateStr.split(".").map(Number);
  return editDate(day, month, year);
};

// parsuje datum DD.MM.YYYY na date o pulnoci
export const parseDateMidnight = (dateStr) => {
  if (!dateStr) return dateStr;
  const [day, month, year] = dateStr.split(".").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

// doplnuje tecky do datumu
export const formatDateInput = (value) => {
  if (!value) return value;
  let digits = value.replace(/\D/g, "");

  if (digits.length > 8) digits = digits.slice(0, 8);

  if (digits.length < 2) {
    return digits;
  }
  if (digits.length <= 2) {
    return `${digits.slice(0, 2)}.`;
  } else if (digits.length < 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.`;
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
  }
};

// prvni pismeno bude velke
export const capitalizeFirst = (text) => {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

//overi format ibanu
export const isValidIBANFormat = (input) => {
  if (!input) return input;
  const cleaned = input.replace(/\s+/g, "").toUpperCase();
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
  return ibanRegex.test(cleaned);
};

//overi format bankovniho cisla pro CZ a SK
export const isCzOrSkAccountFormat = (input) => {
  if (!input) return input;
  const cleaned = input.replace(/\s+/g, "");
  const regex = /^(\d{0,6}-)?\d{2,10}\/\d{4}$/;
  return regex.test(cleaned);
};

// prevede iban na bankovni cislo
export const ibanToBban = (iban) => {
  if (!iban || iban === true || iban === false) return iban;
  const cleaned = iban.replace(/\s+/g, "").toUpperCase();
  const countryCode = cleaned.slice(0, 2);
  if (countryCode === "CZ" || countryCode === "SK") {
    const bban = cleaned.slice(4);
    const bankCode = bban.slice(0, 4);
    const accountPart = bban.slice(4);
    const prefix = accountPart.slice(0, 6).replace(/^0+/, "") || "0";
    const number = accountPart.slice(6).replace(/^0+/, "") || "0";
    return /[1-9]/.test(prefix) ? `${prefix}-${number}/${bankCode}` : `${number}/${bankCode}`;
  }
  return iban;
};

//validuje date
export const validateDate = (inputDate) => {
  console.log(inputDate);
  if (!inputDate) return false;
  let date;

  if (inputDate instanceof Date) {
    date = inputDate;
  } else {
    date = new Date(inputDate);
  }

  if (isNaN(date.getTime())) {
    console.log(date.getTime());
    return false;
  }
  const minDate = new Date("1920-01-01T00:00:00Z");

  if (date.getTime() < minDate.getTime()) {
    console.log(date.getTime());
    console.log(minDate.getTime());

    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedDate = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  if (normalizedDate.getTime() > today.getTime()) {
    console.log(normalizedDate.getTime());
    console.log(today.getTime());
    return false;
  }
  console.log(today.getTime());
  return true;
};

// hleda v poli erroru konkretni
export function hasValidationError(field, errors) {
  if (!Array.isArray(errors)) return false;

  return errors?.some((msg) => typeof msg === "string" && msg.includes(`"${field}"`));
}

// vrati pocet dni mezi dneskem a cislovym datem
export const getDaysUntil = (targetDate, minYearsInPast = 105) => {
  if (!targetDate) return 0;
  if (isNaN(targetDate)) return 0;

  const minAllowedYear = new Date().getFullYear() - minYearsInPast;
  if (targetDate.getFullYear() < minAllowedYear) {
    return 0;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(targetDate);
  expDate.setHours(0, 0, 0, 0);

  const diffTime = expDate.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// vrati datum, ktere nastane za x ni od dneska
export const getDateFromDays = (days) => {
  const count = parseInt(days, 10);
  if (isNaN(count)) return new Date();

  const resultDate = new Date();
  resultDate.setDate(resultDate.getDate() + count);
  resultDate.setHours(12, 0, 0, 0);

  return resultDate;
};

// funkce pro ziskani spravneho labelu pro pole mnozstvi
export const getAmountTexts = (unit) => {
  if (unit === Unit.MULTIPACK) {
    return {
      label: i18n.t("multipackQuantity"),
      placeholder: i18n.t("enterMultipackQuantity"),
      error: i18n.t("errorMultipackQuantityRange"),
    };
  }
  return {
    label: i18n.t("amount"),
    placeholder: i18n.t("enterAmount"),
    error: i18n.t("errorAmountRange"),
  };
};

// vraci mena podle kodu ziskaneho z zeme
export const getCurrency = (countryCode) => {
  const currencySymbols = {
    OTHER: "EUR",
    CZ: "CZK",
    SK: "EUR",
  };
  return currencySymbols[countryCode] || "CZK";
};

// formatuje vstup pro cenu (1 tecka nebo carka, maximalne 2 desetinna mista)
export const formatPriceInput = (text) => {
  let cleaned = text.replace(/[^0-9.,]/g, "");

  // kontrola by tam byla bud 1 carka nebo 1 tecka
  const separatorMatch = cleaned.match(/[.,]/g);
  if (separatorMatch && separatorMatch.length > 1) {
    const firstSeparatorIndex = cleaned.search(/[.,]/);
    const beforeSeparator = cleaned.substring(0, firstSeparatorIndex + 1);
    const afterSeparator = cleaned.substring(firstSeparatorIndex + 1).replace(/[.,]/g, "");
    cleaned = beforeSeparator + afterSeparator;
  }

  // omezeni na 2 desetina mista
  const parts = cleaned.split(/[.,]/);
  if (parts.length > 1 && parts[1].length > 2) {
    const usedSeparator = cleaned.match(/[.,]/)[0];
    cleaned = parts[0] + usedSeparator + parts[1].slice(0, 2);
  }
  return cleaned;
};
