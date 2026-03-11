import { Platform } from "react-native";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import i18n from "@/constants/translations";

let snackbarCallback = null;
export const setSnackbarCallback = (cb) => {
  snackbarCallback = cb;
};

//zobrazi globalni error
export const showGlobalError = (error) => {
  const isNetwork = !error.response;
  const status = error.response?.status;
  const code = error.response?.code || null;

  let message = i18n.t("errorDefault");
  if (isNetwork) message = i18n.t("errorNetwork");
  else if (status === 401) message = i18n.t("sessionExpired");
  else if (status === 429) message = i18n.t("errorDefault");
  else if (status === 403 && code === "category")
    message = i18n.t("errors.category.OWNER_EDITOR_ONLY");

  if (Platform.OS === "ios") {
    toast.error(message, { duration: 4000, position: ToastPosition.TOP });
  } else {
    snackbarCallback?.(message);
  }
};
