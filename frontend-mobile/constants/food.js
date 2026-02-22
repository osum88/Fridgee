import i18n from "@/constants/translations";

export const Unit = {
  MG: "MG",
  G: "G",
  DG: "DG",
  KG: "KG",
  ML: "ML",
  CL: "CL",
  DL: "DL",
  L: "L",
  MULTIPACK: "MULTIPACK",
  NOUNIT: "null",
};

// pomocne pole pro dropdown unit
export const UNIT_OPTIONS = Object.values(Unit).map((unit) => ({
  label:
    unit === "MULTIPACK"
      ? i18n.t("multipack")
      : unit === "null"
        ? i18n.t("noUnit")
        : unit?.toLowerCase(),
  value: unit,
}));

export const Currency = {
  CZK: "CZK",
  EUR: "EUR",
};

// mapovani symbolu
const CURRENCY_SYMBOLS = {
  [Currency.CZK]: "Kč",
  [Currency.EUR]: "€",
};

// pomocne pole pro dropdown men
export const CURRENCY_OPTIONS = Object.values(Currency).map((curr) => ({
  label: CURRENCY_SYMBOLS[curr],
  value: curr,
}));
