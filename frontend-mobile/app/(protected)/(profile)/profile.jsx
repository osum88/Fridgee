import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useUser } from "@/hooks/useUser";
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
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
import { Snackbar } from "react-native-paper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { ToastProvider } from "@backpackapp-io/react-native-toast";


export default function Profile() {
  const color = useThemeColor();
  const { userId } = useUser();
  const [onErrorImage, setOnErrorImage] = useState(false);
  const profilePlaceHolder = useProfilePlaceHolder();
  const { pickImage, takePhoto, uploadImage } = useImageUpload();
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(null);
 
  const { data: userData } = useGetUserQuery(userId, true);

  // useEffect(() => {
  //   toast("Zprávaaax praahkkgjao uživatele", {
  //     position: ToastPosition.BOTTOM,
  //     isSwipeable: true,
  //     onPress: () => {
  //       toast.remove();
  //     },
  //   });
  // }, []);

  const handleImagePick = async (type) => {
    if (type === "camera") {
      // toast.success("Obrázek nahrán!");
      const uri = await takePhoto();
      if (uri) {
        setImage(uri);
        uploadImage(uri);
      }
    } else if (type === "photo") {
      const uri = await pickImage();
      if (uri) {
        setImage(uri);
        uploadImage(uri);
      }
    } else if (type === "remove") {
      setImage("none");
    }
  };

  //profilova fotka
  const sourceImage = useMemo(() => {
    if (!image) {
      return onErrorImage
        ? profilePlaceHolder
        : { uri: `https://picsum.photos/id/${userId}/200/300` }; //tady pak upravti na url fotky z db
    }
    return image === "none" ? profilePlaceHolder : { uri: image };
  }, [profilePlaceHolder, image, onErrorImage, userId]);

  return (
    <ThemedView style={[styles.contentWrapper]}>
      <ThemedView>
        <Image
          alt={i18n.t("profileImage")}
          accessibilityLabel={i18n.t("profileImage")}
          source={sourceImage}
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
          <IconSymbol
            size={responsiveSize.moderate(25)}
            name="camera.fill"
            color={color.text}
          />
        </TouchableOpacity>
      </ThemedView>

      <ProfileImageSelector
        visible={visible}
        setVisible={setVisible}
        onPress={(type) => handleImagePick(type)}
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
      {/* 
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        action={{
          label: 'Zavřít',
          onPress: () => setVisible(false),
        }}
      >
        Úspěšně uloženo!
      </Snackbar> */}
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
  tap: {
    //pak smazat
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
