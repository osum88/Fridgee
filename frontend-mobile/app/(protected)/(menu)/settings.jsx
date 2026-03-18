import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { responsiveSize } from "@/utils/scale";
import { useRouter } from "expo-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { MenuList } from "@/components/common/MenuItem";

const MENU_ITEMS = [
  {
    key: "language",
    icon: "globe",
    route: "/(protected)/(settingsItem)/changeLanguage",
    color: "text",
  },
  {
    key: "theme",
    icon: "circle.lefthalf.fill",
    route: "/(protected)/(settingsItem)/changeTheme",
    color: "text",
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  useLanguage();
  return (
    <ThemedView style={styles.container}>
      <MenuList items={MENU_ITEMS} onPress={(item) => router.push(item.route)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
});
