import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useUser } from "@/hooks/useUser";
import { Image, Pressable, StyleSheet, TouchableOpacity } from "react-native";
import { useMemo, useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/constants/translations";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useGetUserQuery } from "@/hooks/user/useUserQuery";
import { useImageUpload } from "@/hooks/image/useImageUpload";
import { ProfileImageSelector } from "@/components/image/ProfileImageSelector";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
import { ActivityIndicator, Snackbar } from "react-native-paper";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { ToastProvider } from "@backpackapp-io/react-native-toast";
import useUpdateUserProfileImageMutation from "@/hooks/user/useUpdateUserProfileImageMutation";
import useDeleteUserProfileImageMutation from "@/hooks/user/useDeleteUserProfileImageMutation";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { useCachedProfileImage } from "@/hooks/image/useCachedProfileImage";
import { useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const color = useThemeColor();
  const { userId } = useUser();
  const profilePlaceHolder = useProfilePlaceHolder();
  const { pickImage, takePhoto, uploadImage } = useImageUpload();
  const [visible, setVisible] = useState(false);
  const [image, setImage] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const queryClient = useQueryClient(); //smazat

  //update profilovky
  const { updateUserProfileImageMutation } = useUpdateUserProfileImageMutation({
    setImage,
  });
  //smazani profilovky
  const { deleteUserProfileImageMutation } = useDeleteUserProfileImageMutation({
    setImage,
  });

  //user data
  const { data: userData, isLoading } = useGetUserQuery(userId, true);

  //nacteni profilovky z cache
  const { cacheProfileImage } = useCachedProfileImage(
    userId,
    isLoading,
    userData?.data
  );

  // useEffect(() => {
  //   toast("Zprávaaax praahkkgjao uživatele", {
  //     position: ToastPosition.BOTTOM,
  //     isSwipeable: true,
  //     onPress: () => {
  //       toast.remove();
  //     },
  //   });
  // }, []);

  //vyber moznosti pri zmene profilovky
  const handleImagePick = async (type) => {
    if (type === "camera") {
      // toast.success("Obrázek nahrán!");
      const uri = await takePhoto();
      if (uri) {
        setImage(uri);
        const { formData, uri: uploadUri } = await uploadImage(uri);
        updateUserProfileImageMutation.mutate({ formData, uploadUri });
      }
    } else if (type === "photo") {
      const uri = await pickImage();
      if (uri) {
        setImage(uri);
        const { formData, uri: uploadUri } = await uploadImage(uri);
        updateUserProfileImageMutation.mutate({ formData, uploadUri });
      }
    } else if (type === "remove") {
      setImage("none");
      deleteUserProfileImageMutation.mutate();
    }
  };

  //pole odkazu, pokud nefunguje odkza z cache pak se pouzije cloud jinak placeholder
  const imageSources = useMemo(() => {
    const version = userData?.data?.profilePictureUrl?.includes("?v=")
      ? userData.data.profilePictureUrl.split("?v=")[1]
      : Date.now();

    const cacheUri = cacheProfileImage
      ? `${cacheProfileImage}?v=${version}`
      : null;
    const cloudUri = userData?.data?.profilePictureUrl
      ? `${IMAGEKIT_URL_ENDPOINT}${userData.data.profilePictureUrl}`
      : null;

    return [
      cacheUri ? { uri: cacheUri } : null,
      cloudUri ? { uri: cloudUri } : null,
      profilePlaceHolder,
    ].filter(Boolean);
  }, [
    cacheProfileImage,
    userData?.data?.profilePictureUrl,
    profilePlaceHolder,
  ]);

  //profilova fotka
  const sourceImage = useMemo(() => {
    if (image === "none") return profilePlaceHolder;
    if (image) return { uri: image };
    if (userData?.data?.profilePictureUrl === "none") return profilePlaceHolder;

    return imageSources[imageIndex] ?? profilePlaceHolder;
  }, [
    image,
    imageIndex,
    imageSources,
    userData?.data?.profilePictureUrl,
    profilePlaceHolder,
  ]);

  return (
    <ThemedView style={[styles.contentWrapper]}>
      <ThemedView>
        {isLoading && !userData?.data?.profilePictureUrl ? (
          <ActivityIndicator
            size="large"
            color={color.borderImage}
            style={[styles.profileImage, { borderColor: color.borderImage }]}
          />
        ) : (
          <Image
            alt={i18n.t("profileImage")}
            accessibilityLabel={i18n.t("profileImage")}
            defaultSource={profilePlaceHolder}
            source={sourceImage}
            onError={() => {
              if (imageIndex < imageSources.length - 1) {
                setImageIndex(imageIndex + 1);
              }
            }}
            style={[styles.profileImage, { borderColor: color.borderImage }]}
          />
        )}

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
        onPress={() =>
          queryClient.invalidateQueries({ queryKey: ["user", userId] })
        }
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
