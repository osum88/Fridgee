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
  return new Date(
    Date.UTC(year, month - 1, day, hours, minutes, seconds, milliseconds)
  );
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
  const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  return date;
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
    return /[1-9]/.test(prefix)
      ? `${prefix}-${number}/${bankCode}`
      : `${number}/${bankCode}`;
  }
  return iban;
};

//validuje date
export const validateDate = (inputDate) => {
  console.log(inputDate)
  if (!inputDate) return false;
  let date;

  if (inputDate instanceof Date) {
    date = inputDate;
  } else {
    date = new Date(inputDate);
  }

  if (isNaN(date.getTime())) {
     console.log(date.getTime())
    return false;
  }
  const minDate = new Date("1920-01-01T00:00:00Z");

  if (date.getTime() < minDate.getTime()) {
         console.log(date.getTime())
         console.log(minDate.getTime())


    return false;
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const normalizedDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  if (normalizedDate.getTime() > today.getTime()) {
    console.log(normalizedDate.getTime())
    console.log(today.getTime())
    return false;
  }
  console.log(today.getTime())
  return true;
};

// hleda v poli erroru konkretni
export function hasValidationError(field, errors) {
  if (!Array.isArray(errors)) return false;

  return errors?.some(
    (msg) => typeof msg === "string" && msg.includes(`"${field}"`)
  );
}
