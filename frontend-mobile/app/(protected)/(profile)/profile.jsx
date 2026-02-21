import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useUser } from "@/hooks/useUser";
import { Image, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { useMemo, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useGetUserQuery } from "@/hooks/queries/user/useUserQuery";
import { useImageUpload } from "@/hooks/image/useImageUpload";
import { ProfileImageSelector } from "@/components/image/ProfileImageSelector";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
import { ActivityIndicator, Snackbar } from "react-native-paper";
import { toast, ToastPosition, ToastProvider } from "@backpackapp-io/react-native-toast";
import useUpdateUserProfileImageMutation from "@/hooks/queries/user/useUpdateUserProfileImageMutation";
import useDeleteUserProfileImageMutation from "@/hooks/queries/user/useDeleteUserProfileImageMutation";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { useCachedProfileImage } from "@/hooks/image/useCachedProfileImage";
import { useQueryClient } from "@tanstack/react-query";
import { formatDate, ibanToBban } from "@/utils/stringUtils";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Card } from "@/components/Card/Card";
import { CardItem } from "@/components/Card/CardItem";
import { CardItemSecret } from "@/components/Card/CardItemSecret";
import { Link } from "expo-router";

export default function Profile() {
  const color = useThemeColor();
  const { userId } = useUser();
  const profilePlaceHolder = useProfilePlaceHolder();
  const { pickImage, takePhoto, uploadImage } = useImageUpload();
  const [visible, setVisible] = useState(false);
  const [bankNumber, setBankNumber] = useState("");
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
  const { cacheProfileImage } = useCachedProfileImage(userId, isLoading, userData?.data);

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

    const cacheUri = cacheProfileImage ? `${cacheProfileImage}?v=${version}` : null;
    const cloudUri = userData?.data?.profilePictureUrl
      ? `${IMAGEKIT_URL_ENDPOINT}${userData.data.profilePictureUrl}`
      : null;

    return [
      cacheUri ? { uri: cacheUri } : null,
      cloudUri ? { uri: cloudUri } : null,
      profilePlaceHolder,
    ].filter(Boolean);
  }, [cacheProfileImage, userData?.data?.profilePictureUrl, profilePlaceHolder]);

  //profilova fotka
  const sourceImage = useMemo(() => {
    if (image === "none") return profilePlaceHolder;
    if (image) return { uri: image };
    if (userData?.data?.profilePictureUrl === "none") return profilePlaceHolder;

    return imageSources[imageIndex] ?? profilePlaceHolder;
  }, [image, imageIndex, imageSources, userData?.data?.profilePictureUrl, profilePlaceHolder]);

  const isCZorSK = userData?.data?.country === "CZ" || userData?.data?.country === "SK";

  const countryText = useMemo(() => {
    if (userData?.data?.country === "CZ") return `${i18n.t("czech")} (Kč)`;
    if (userData?.data?.country === "SK") return `${i18n.t("slovakia")} (€)`;
    if (userData?.data?.country === "OTHER") return `${i18n.t("otherZ")} (€)`;
    return "";
  }, [userData?.data?.country]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ThemedView safe={true} style={[styles.contentWrapper]}>
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
            <IconSymbol size={responsiveSize.moderate(25)} name="camera.fill" color={color.text} />
          </TouchableOpacity>
        </ThemedView>
        <ProfileImageSelector
          visible={visible}
          setVisible={setVisible}
          onPress={(type) => handleImagePick(type)}
        />

        {(userData?.data?.name || userData?.data?.surname) && (
          <ThemedText style={[styles.title, { textTransform: "capitalize" }]}>
            {userData?.data?.name} {userData?.data?.surname}
          </ThemedText>
        )}

        {/* informace o profilu */}
        <ThemedView style={styles.section}>
          <ThemedView style={styles.sectionText}>
            <ThemedText style={styles.sectionTitle}>{i18n.t("personalInfo")}</ThemedText>
            <Link
              href={{
                pathname: "/editProfile",
                params: {
                  userData: JSON.stringify(userData),
                },
              }}
              asChild
            >
              <ThemedText>{i18n.t("edit")}</ThemedText>
            </Link>
          </ThemedView>
          <Card>
            <CardItem
              iconName={"person"}
              iconSize={responsiveSize.moderate(19)}
              label={i18n.t("username")}
              value={userData?.data?.username}
              isLoading={isLoading}
            />

            <ThemedLine style={{ height: 1 }} />

            <CardItem
              iconName={"envelope"}
              iconSize={responsiveSize.moderate(19)}
              label={i18n.t("email")}
              value={userData?.data?.email}
              isLoading={isLoading}
            />

            {userData?.data?.birthDate && <ThemedLine style={{ height: 1 }} />}

            {userData?.data?.birthDate && (
              <CardItem
                iconName={"birthday.cake"}
                iconSize={responsiveSize.moderate(19)}
                label={i18n.t("birthdate")}
                value={formatDate(userData?.data?.birthDate)}
                isLoading={isLoading}
              />
            )}

            {userData?.data?.gender !== "UNSPECIFIED" && <ThemedLine style={{ height: 1 }} />}

            {userData?.data?.gender !== "UNSPECIFIED" && (
              <CardItem
                iconName={"person.crop.square"}
                iconSize={responsiveSize.moderate(19)}
                label={i18n.t("gender")}
                value={
                  userData?.data?.gender === "MALE"
                    ? i18n.t("male")
                    : userData?.data?.gender === "FEMALE"
                      ? i18n.t("female")
                      : userData?.data?.gender === "OTHER"
                        ? i18n.t("otherS")
                        : ""
                }
                isLoading={isLoading}
              />
            )}

            {userData?.data?.bankNumber && <ThemedLine style={{ height: 1 }} />}

            {userData?.data?.country && (
              <CardItem
                iconName={"globe"}
                iconSize={responsiveSize.moderate(19)}
                label={`${i18n.t("bankAccountCountry")} / ${i18n.t("currency")}`}
                value={countryText}
                isLoading={isLoading}
              />
            )}

            {userData?.data?.bankNumber && <ThemedLine style={{ height: 1 }} />}

            {userData?.data?.bankNumber && (
              <CardItemSecret
                iconName={"building.columns"}
                iconSize={responsiveSize.moderate(19)}
                label={isCZorSK ? i18n.t("bankNumber") : "IBAN"}
                value={isCZorSK ? ibanToBban(bankNumber) : bankNumber}
                isLoading={isLoading}
                isSecrete={true}
                type={isCZorSK ? "czOrSk" : "iban"}
                onChangeText={(text) => setBankNumber(text)}
              />
            )}

            {userData?.data?.isAdmin && <ThemedLine style={{ height: 1 }} />}

            {userData?.data?.isAdmin && (
              <CardItem
                iconName={"checkmark.shield"}
                iconSize={responsiveSize.moderate(19)}
                label={i18n.t("administrator")}
                value={i18n.t("yes")}
                isLoading={isLoading}
              />
            )}

            <ThemedLine style={{ height: 1 }} />

            <CardItem
              iconName={"calendar"}
              iconSize={responsiveSize.moderate(19)}
              label={i18n.t("registrationDate")}
              value={formatDate(userData?.data?.createdAt)}
              isLoading={isLoading}
            />
          </Card>
        </ThemedView>

        {/* Actions */}
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { marginBottom: responsiveSize.vertical(8) }]}>
            {i18n.t("tools")}
          </ThemedText>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => queryClient.invalidateQueries({ queryKey: ["user", userId] })}
          >
            <IconSymbol name="gear" size={20} color={"#007AFF"} />
            <ThemedText style={styles.actionButtonText}>{i18n.t("changePassword")}</ThemedText>
            <IconSymbol name="chevron.right" size={16} color={"#6C757D"} />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    // paddingBottom: responsiveSize.vertical(20),
  },

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
    width: responsiveSize.moderate(125),
    height: responsiveSize.moderate(125),
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

  title: {
    fontSize: responsiveFont(24),
    fontWeight: "700",
    textAlign: "center",
  },
  section: {
    width: "100%",
  },
  sectionText: {
    marginBottom: responsiveSize.vertical(2),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  sectionTitle: {
    fontSize: responsiveFont(16),
    fontWeight: "600",
  },
  edit: {
    paddingBottom: responsiveSize.vertical(6),
    paddingRight: responsiveSize.horizontal(1),
    paddingLeft: responsiveSize.horizontal(6),
    fontSize: responsiveFont(14),
    fontWeight: "400",
  },

  actionButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "transparent",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,

    // ios
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android
    elevation: 4,
  },
  actionButtonText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    fontWeight: "500",
  },
});
