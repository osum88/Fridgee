import { Image } from "expo-image";
import { Platform, StyleSheet, Pressable } from "react-native";

import { Collapsible } from "@/components/Collapsible";
import { ExternalLink } from "@/components/ExternalLink";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "expo-router";
import i18n from "@/constants/translations";
import { useUser } from "@/hooks/useUser";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
export default function TabTwoScreen() {
  const { signOut } = useUser();

  useLanguage();
  const currentColors = useThemeColor();
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#deccccff", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#c3a3a3ff"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Explore</ThemedText>
      </ThemedView>
      <ThemedText>This app includes example code to help you get started.</ThemedText>
      <Collapsible title="File-based routing">
        <ThemedText>This app has two screens: </ThemedText>
        <ThemedText>sets up the tab navigator.</ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <ThemedView style={styles.stepContainer}>
        <Link
          href="/(auth)/login"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
              color: currentColors.onPrimary,
            },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
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
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            Log out
          </ThemedText>
        </Pressable>

        <Link
          href="/(auth)/resendVerifyEmail"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("resendEmail")}
          </ThemedText>
        </Link>
        <Link
          href="/(auth)/resetPassword"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("resetPassword")}
          </ThemedText>
        </Link>

        <Link
          href="/(auth)/emailVerify"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("emailVerify")}
          </ThemedText>
        </Link>

        <Link
          href="/searchFriends"
          style={[
            styles.tap,
            {
              backgroundColor: currentColors.primary,
            },
          ]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("search")}{" "}
          </ThemedText>
        </Link>

        <Link href="/friendsList" style={[styles.tap, { backgroundColor: currentColors.primary }]}>
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("friends")}
          </ThemedText>
        </Link>

        <Link
          href="/addFoodManually"
          style={[styles.tap, { backgroundColor: currentColors.primary }]}
        >
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            Přidat jídlo
          </ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },

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
