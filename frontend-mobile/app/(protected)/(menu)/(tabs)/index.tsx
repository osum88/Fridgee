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
import { Card } from "@/components/Card/Card";
import { CardItem } from "@/components/Card/CardItem";
import { ThemedLine } from "@/components/themed/ThemedLine";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";

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
          <ThemedText type="subtitle" style={[styles.tapText, { color: currentColors.onPrimary }]}>
            {i18n.t("loginButton")}
          </ThemedText>
        </Link>

        {/* <Card>
          <CardItem
            iconName={"person"}
            iconSize={responsiveSize.moderate(19)}
            label={i18n.t("username")}
            value={"Asd"}
            isLoading={false}
          />

          <ThemedLine style={{ height: 1 }} />
          <CardItem
            iconName={"envelope"}
            iconSize={responsiveSize.moderate(19)}
            label={i18n.t("email")}
            value={"userData?.data?.email"}
            isLoading={false}
          />
        </Card> */}
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
