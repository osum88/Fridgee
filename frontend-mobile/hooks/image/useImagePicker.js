import { Alert, Linking } from "react-native";
import i18n from "@/constants/translations";
import * as ImagePicker from "expo-image-picker";

export const useImagePicker = () => {
  //vyfoceni fotky
  const takePhoto = async () => {
    try {
      //zjisti jestli je udeleni opravneni
      const { status } = await ImagePicker.getCameraPermissionsAsync();
      //zajisti opravneni
      if (status !== "granted") {
        const { status: newStatus } =
          await ImagePicker.requestCameraPermissionsAsync();

        if (newStatus !== "granted") {
          Alert.alert(
            i18n.t("requiredPermissions"),
            i18n.t("requiredPermissionsCameraMessage"),
            [
              {
                text: i18n.t("openSettings"),
                onPress: () => Linking.openSettings(),
              },
              { text: i18n.t("cancel"), style: "cancel" },
            ]
          );
          return;
        }
      }
      let result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        //   setImage(result.assets[0].uri);
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error uploadImage:", error);
    }
  };

  //vybrani fotky
  const pickImage = async () => {
    try {
      //zjisti jestli je udeleni opravneni
      const { status } = await ImagePicker.getMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        //zajisti opravneni
        const { status: newStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (newStatus !== "granted") {
          Alert.alert(
            i18n.t("requiredPermissions"),
            i18n.t("requiredPermissionsStorageMessage"),
            [
              {
                text: i18n.t("openSettings"),
                onPress: () => Linking.openSettings(),
              },
              { text: i18n.t("cancel"), style: "cancel" },
            ]
          );
          return;
        }
      }
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        legacy: true,
      });

      if (!result.canceled) {
        //   setImage(result.assets[0].uri);
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error("Error pickImage:", error);
    }
  };

  return { pickImage, takePhoto };
};
