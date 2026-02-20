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
  NOUNIT: "NOUNIT",
};

// pomocne pole pro dropdown
export const UNIT_OPTIONS = Object.values(Unit).map((unit) => ({
  label:
    unit === "MULTIPACK"
      ? i18n.t("multipack")?.toLowerCase()
      : unit === "NOUNIT"
        ? i18n.t("noUnit")?.toLowerCase()
        : unit?.toLowerCase(),
  value: unit,
}));


