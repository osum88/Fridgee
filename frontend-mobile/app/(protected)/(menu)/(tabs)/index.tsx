import { Image } from "expo-image";
import { Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { useUser } from "@/hooks/useUser";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useLanguage } from "@/contexts/LanguageContext";

export default function HomeScreen() {
  const { signOut } = useUser();
  const currentColors = useThemeColor();
  useLanguage();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.stepContainer}>
        <Link
          href="../../login"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
              color: currentColors.onPrimary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("loginButton")}
          </ThemedText>
        </Link>

        <Pressable
          onPress={() => signOut()}
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            Log out
          </ThemedText>
        </Pressable>

        <Link
          href="../../resendVerifyEmail"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("resendEmail")}
          </ThemedText>
        </Link>
        <Link
          href="../../resetPassword"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("resetPassword")}
          </ThemedText>
        </Link>

        <Link
          href="../../emailVerify"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("emailVerify")}
          </ThemedText>
        </Link>

        <Link
          href="../searchFriends"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("search")}{" "}
          </ThemedText>
        </Link>

        <Link
          href="../friendsList"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("friends")}
          </ThemedText>
        </Link>

        <Link
          href="../profile"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.tapText, { color: currentColors.onPrimary }]}
          >
            {i18n.t("profile")}{" "}
          </ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
  stepContainer: {
    gap: 12,
    marginBottom: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tap: {
    flexBasis: "48%",
    padding: 16,
    textAlign: "center",
    borderRadius: 8,
  },
  tapText: {
    textAlign: "center",
  },
});
