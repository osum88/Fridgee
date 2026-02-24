import { createShortPaymentDescriptor } from "@spayd/core";
import { BadRequestError } from "../errors/errors.js";
import { isValid, fromBBAN, isValidBBAN, electronicFormat } from "iban";

// generates SPAYD payment ve foramtu string pro vytvoreni QRkodu pro platby
export const generateSpaydPaymentFormat = (iban, amount, currency, message) => {
  try {
    const spayd = createShortPaymentDescriptor({
      acc: iban,
      am: amount,
      cc: currency,
      msg: message,
    });
    if (!spayd || typeof spayd !== "string") {
      throw new BadRequestError("SPAYD generation failed or returned invalid format.", {
        type: "bankNumber",
        code: "SPAYD_GENERATION_FAILED",
      });
    }
    return spayd;
  } catch (error) {
    throw new BadRequestError("Error generate SPAYD payment format.", {
      type: "bankNumber",
      code: "SPAYD_INVALID_FORMAT",
    });
  }
};

// generuje EPC platbu ve formatu pro vytvoreni QR kodu pro platby
export const generateEpcPaymentFormat = (name, iban, amount, bic, message) => {
  const lines = [
    "BCD", // identifikator formátu
    "001", // verze
    "1", // SEPA platba
    "SCT", // SEPA Credit Transfer
    bic || "", // volitelný BIC
    name.substring(0, 70), // prijemce
    iban,
    `EUR${amount}`, // castka
    message.substring(0, 140) || "", // zprava
  ];
  return lines.join("\n");
};

// generuje platbu ve formatu pro vytvoreni QR kodu pro platby
export const generatePaymentFormat = ({
  countryCode,
  iban,
  amount,
  currency,
  message,
  name,
  bic = "",
}) => {
  if (!iban || !countryCode || !amount) {
    throw new BadRequestError("IBAN, country code and amount are required for EPC payment format.");
  }
  if (countryCode === "CZ" || countryCode === "SK") {
    if (!currency) {
      throw new BadRequestError("Currency is required for SPAYD.");
    }
    return generateSpaydPaymentFormat(iban, amount, currency, (message = ""));
  } else {
    if (!name) {
      throw new BadRequestError("Name is required for EPC.");
    }
    return generateEpcPaymentFormat(name, iban, amount, (bic = ""), (message = ""));
  }
};

// validace IBAN a bankovniho cisla a prevod na iban
export const isValidIbanOrBban = (input, countryCode) => {
  if (!input) return input;
  const cleaned = input.replace(/\s+/g, "").toUpperCase();

  //ceske nebo slovenske bankovni cislo
  const bbanRegex = /^(\d{0,6}-)?\d{2,10}\/\d{4}$/;
  if (bbanRegex.test(cleaned)) {
    const [accountPart, bankCode] = cleaned.split("/");
    const [prefix, number] = accountPart.includes("-")
      ? accountPart.split("-")
      : ["0", accountPart];

    const paddedPrefix = prefix.padStart(6, "0");
    const paddedNumber = number.padStart(10, "0");
    const bban = `${bankCode}${paddedPrefix}${paddedNumber}`;

    if (!isValidBBAN(countryCode, bban)) {
      throw new BadRequestError("Invalid bank number format.", {
        type: "bankNumber",
        code: "INVALID_FORMAT",
      });
    }

    const iban = fromBBAN(countryCode, bban);

    if (!isValid(iban)) {
      throw new BadRequestError("Converted IBAN is invalid.", {
        type: "bankNumber",
        code: "INVALID_CONVERT_IBAN",
      });
    }
    // valida pro spayd
    generateSpaydPaymentFormat(iban);

    return electronicFormat(iban);
  }
  //IBAN
  const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$/;
  if (ibanRegex.test(cleaned)) {
    if (!isValid(cleaned)) {
      throw new BadRequestError("Invalid IBAN format.", {
        type: "bankNumber",
        code: "INVALID_IBAN",
      });
    }
    return electronicFormat(cleaned);
  }
  throw new BadRequestError("Invalid IBAN or bank number format.", {
    type: "bankNumber",
    code: "BANK_NUMBER_GENERIC_ERROR",
  });
};
