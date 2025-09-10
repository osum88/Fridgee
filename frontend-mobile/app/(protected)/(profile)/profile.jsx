import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useUser } from "@/hooks/useUser";
import {
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
import { useImageUpload } from "@/hooks/image/useImageUpload";
import { ProfileImageSelector } from "@/components/image/ProfileImageSelector";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";

export default function Profile() {
  const color = useThemeColor();
  const { userId } = useUser();
  const [onErrorImage, setOnErrorImage] = useState(false);
  const profilePlaceHolder = useProfilePlaceHolder();
  const { pickImage, takePhoto, uploadImage } = useImageUpload();
  const [visible, setVisible] = useState(false);

  const [image, setImage] = useState(null);

  const { data: userData } = useGetUserQuery(userId, true);

  const handleImagePick = async () => {
    // const uri = await pickImage();
    // setImage(uri);
    // uploadImage(uri);
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
            setVisible(true);
          }}
          style={[styles.cameraButton, { backgroundColor: color.borderImage }]}
        >
          <IconSymbol size={responsiveSize.moderate(25)} name="camera.fill" color={color.text} />
        </TouchableOpacity>
      </ThemedView>

      <ProfileImageSelector
        visible={visible}
        setVisible={setVisible}
        onPress={() => handleImagePick()}
      />

      <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
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
      
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flexGrow: 1,
    alignItems: "center",
    gap: responsiveSize.vertical(18),
    paddingHorizontal: responsiveSize.horizontal(20),
    paddingTop: responsiveSize.vertical(18),
    width: "100%",
  },
  tap: {//pak smazat
    padding: 16,
    textAlign: "center",
    borderRadius: 8,
  },
  profileImage: {
    width: responsiveSize.moderate(130),
    height: responsiveSize.moderate(130),
    borderRadius: responsiveSize.moderate(70),
    borderWidth: 3,
  },
  cameraButton: {
    width: responsiveSize.moderate(47),
    height: responsiveSize.moderate(47),
    borderRadius: responsiveSize.moderate(70),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
