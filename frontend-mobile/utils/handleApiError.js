import i18n from "@/constants/translations";
import { resetErrors } from "./stringUtils";

// nastavuje chyby z api
export const handleApiError = (error, setFieldErrors, fieldErrors = null, defaultType = null) => {
  const { status, type, code } = error.response?.data || {};
  const isObjectState = fieldErrors !== null && typeof fieldErrors === "object";

  //resetuje errory
  resetErrors(setFieldErrors, fieldErrors);

  // pomocná funkce, ktera zjisti, zda preklad skutecne existuje
  const getTranslation = (path) => {
    const translation = i18n.t(path);
    if (translation.includes("missing") || translation === path) {
      return null;
    }
    return translation;
  };

  // pomocna funkce pro nastaveni
  const setter = (errorMessage, fieldType) => {
    if (isObjectState) {
      setFieldErrors((prev) => ({ ...prev, [fieldType]: errorMessage }));
    } else {
      setFieldErrors(errorMessage);
    }
  };

  // konkretni validacni chyby
  if ((status === 400 || status === 409) && type && code) {
    const specificKey = `errors.${type}.${code}`;
    const defaultKey = `errors.${type}.default`;

    const specificTranslation = getTranslation(specificKey);
    if (specificTranslation) {
      setter(i18n.t(specificKey), type);
      return;
    }

    const defaultTranslation = getTranslation(defaultKey);
    if (defaultTranslation) {
      setter(i18n.t(defaultKey), type);
      return;
    }
  }

  let finalMsg = i18n.t("errorDefault");
  if (!error.response && error.request) finalMsg = i18n.t("errorNetwork");
  else if (status === 429) finalMsg = i18n.t("errorTooManyRequest");

  // Vazne a globalni chyby
  if (isObjectState) {
    const highlightAll = Object.fromEntries(Object.keys(fieldErrors).map((key) => [key, " "]));

    // rosviti error vsem inputum a defaultnimu zobrazi text
    setFieldErrors({
      ...highlightAll,
      [defaultType || "general"]: finalMsg,
    });
  } else {
    setter(finalMsg, defaultType);
  }
  return;
};
