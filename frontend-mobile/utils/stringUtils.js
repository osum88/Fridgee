// prevede date do DD.MM.YYYY
export const formatDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
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
