import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useUser } from "@/hooks/useUser";
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/constants/translations";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useGetUserQuery } from "@/hooks/user/useUserQuery";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useImageUpload } from "@/hooks/image/useImageUpload";

export default function Profile() {
  const color = useThemeColor();
  const { userId } = useUser();
  const [onErrorImage, setOnErrorImage] = useState(false);
  const profilePlaceHolder = useProfilePlaceHolder();
  const { pickImage, takePhoto, uploadImage } = useImageUpload();

  const [image, setImage] = useState(null);
  const [image1, setImage1] = useState(null);

  const { data: userData } = useGetUserQuery(userId, true);

  const handleImagePick = async () => {
    const uri = await pickImage();
    setImage(uri)
    uploadImage(uri)
  };

  
  return (
    <ThemedView style={[styles.contentWrapper]}>
      <ThemedView>
        <Image
          alt={i18n.t("profileImage")}
          accessibilityLabel={i18n.t("profileImage")}
          source={onErrorImage ? profilePlaceHolder : { uri: image }}
          defaultSource={profilePlaceHolder}
          onError={() => setOnErrorImage(true)}
          style={[styles.profileImage, { borderColor: color.borderImage }]}
        />
        <TouchableOpacity
          onPress={() => {
            handleImagePick();
          }}
          style={[styles.cameraButton, { backgroundColor: color.borderImage }]}
        >
          <IconSymbol size={26} name="camera.fill" color={color.text} />
        </TouchableOpacity>
      </ThemedView>

      {/* <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
        Profil uživatele
      </ThemedText>
      <ThemedText>Name: {userData?.data?.name}</ThemedText>
      <ThemedText>Surname: {userData?.data?.surname}</ThemedText>
      <ThemedText>Email: {userData?.data?.email}</ThemedText>
      <ThemedText>Username: {userData?.data?.username}</ThemedText>

      <Pressable
        onPress={() => console.log("daa")}
        style={[
          styles.tap,
          {
            backgroundColor: color.primary,
          },
        ]}
      >
        <ThemedText
          type="subtitle"
          style={[styles.tapText, { color: color.onPrimary }]}
        >
          Photo
        </ThemedText> 
      
      </Pressable>*/}

      <Image
        alt={i18n.t("profileImage")}
        accessibilityLabel={i18n.t("profileImage")}
        source={onErrorImage ? profilePlaceHolder : { uri: image1 }}
        defaultSource={profilePlaceHolder}
        onError={() => setOnErrorImage(true)}
        style={[styles.profileImage, { borderColor: color.borderImage }]}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flexGrow: 1,
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    width: "100%",
  },
  tap: {
    padding: 16,
    textAlign: "center",
    borderRadius: 8,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
  },
  cameraButton: {
    width: 50,
    height: 50,
    borderRadius: 65,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
