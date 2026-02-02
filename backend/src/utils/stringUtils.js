export const formatTitleCase = (text) => {
  if (!text || typeof text !== "string") return text;

  const trimmed = text.trim();
  if (trimmed.length === 0) return trimmed;

  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();
};
