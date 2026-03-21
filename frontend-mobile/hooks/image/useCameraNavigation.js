import { useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Alert, Linking } from "react-native";
import i18n from "@/constants/translations";

export function useCameraNavigation() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  const navigateToScanner = async (type = "add", targetRoute = "../scannerAdd") => {
    // pokud ma povoleni pokracuje
    if (permission?.granted) {
      router.push({ pathname: targetRoute, params: { type } });
      return;
    }

    // pokud muzem pozadat pozadame, po schvaleni navigujem
    if (permission?.canAskAgain) {
      const { status } = await requestPermission();
      if (status === "granted") {
        router.push({ pathname: targetRoute, params: { type } });
      }
      return;
    }

    // trvale zamitnuto, musi do nastaveni
    Alert.alert(i18n.t("requiredPermissions"), i18n.t("requiredPermissionsCameraMessage"), [
      {
        text: i18n.t("openSettings"),
        onPress: () => Linking.openSettings(),
      },
      {
        text: i18n.t("cancel"),
        style: "cancel",
      },
    ]);
  };

  return { navigateToScanner, permission };
}
