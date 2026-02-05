/**
 * Změní string na string začínající velkým písmenem, zbytek malým
 * @param {string} text 
 * @returns {string}
 */
export const formatTitleCase = (text) => {
  if (!text || typeof text !== "string") return text;

  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
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
    return date.toISOString().split('T')[0];
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
  export const determineUpdateValue = (current, provided) => {
    // pokud jsou hodnoty Date pak se prevedou na ISO string
    const currentStr = current instanceof Date ? current.toISOString() : current;
    const providedStr = provided instanceof Date ? provided.toISOString() : provided;
    // pokud hodnota chyby nebo je stejna
    if (provided === undefined || providedStr === currentStr) return undefined;
    // pokud null nebo "" chcem smazat
    if (provided === null || provided === "") return null;
    return provided;
  };