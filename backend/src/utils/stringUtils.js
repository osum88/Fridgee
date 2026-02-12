/**
 * Změní string na string začínající velkým písmenem, zbytek malým (isLowerCase = true)
 * @param {string} text
 * @returns {string}
 */
export const formatTitleCase = (text, isLowerCase = true) => {
  if (!text || typeof text !== "string") return text;

  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;
  if (isLowerCase) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
  }
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
};

/**
 * Převede Date objekt nebo string na formát ISO YYYY-MM-DD, jinak vrátí null
 * @param {String|Date} input - Datum, které se má formátovat na ISO
 * @returns {String|Null} ISO datum nebo null při neúspěchu
 */
export const formatToISODate = (input) => {
  if (!input) return null;

  const date = new Date(input);

  if (isNaN(date.getTime())) {
    console.error("Attempted to format invalid date:", input);
    return null;
  }
  return date.toISOString().split("T")[0];
};

//Normalizuje datum na format začátku dne v UTC (00:00:00.000)
export const normalizeDate = (dateInput) => {
  if (dateInput === undefined) return undefined;
  if (dateInput === null || dateInput === "") return null;

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    console.error("Error parsing date:", dateInput);
    return null;
  }

  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// pomocna funkce pro rozhodnuti, zda hodnotu menit, smazat nebo nechat
export const determineUpdateValue = (current, provided, isNumber = false) => {
  // pokud jsou hodnoty Date pak se prevedou na ISO string
  const currentStr = current instanceof Date ? current.toISOString() : current;
  const providedStr = provided instanceof Date ? provided.toISOString() : provided;
  // pokud hodnota chyby nebo je stejna
  if (
    provided === undefined ||
    providedStr === currentStr ||
    ([null, ""].includes(providedStr) && [null, ""].includes(currentStr))
  )
    return undefined;
  // pokud null nebo "" chcem smazat
  if (provided === null || provided === "") return isNumber ? 0 : null;
  return provided;
};

//vraci true pokud neco neni undefined
export const isAnyValueDefined = (obj) => {
  return Object.values(obj).some((value) => value !== undefined);
};

// převede řetězec na mala pismena a odstraní diakritiku
export const normalizeText = (str) => {
  if (!str || typeof str !== "string") return str;

  return str
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
};
