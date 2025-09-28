import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { responsiveSize, responsivePadding } from "@/utils/scale";
import { ThemedText } from "@/components/themed/ThemedText";
import { Link } from "expo-router";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useLanguage } from "@/contexts/LanguageContext";


export default function ChangeTheme() {
  const color = useThemeColor();
  useLanguage();

  return (
    <ThemedView style={styles.container}>
      <Link
        href="../changeLanguage"
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
          {i18n.t("language")}
        </ThemedText>
      </Link>
      <Link
        href="../changeTheme"
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
          {i18n.t("theme")}
        </ThemedText>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    ...responsivePadding(28),
    flex: 1,
    gap: responsiveSize.vertical(18),
  },
  tap: {
    padding: 16,
    textAlign: "center",
    borderRadius: 8,
  },
});
