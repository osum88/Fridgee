import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { CheckableItem } from "@/components/common/CheckableItem";
import { useCallback } from "react";
import i18n from "@/constants/translations";
import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";

export default function ChangeTheme() {
  const { theme, setTheme, colorScheme } = useTheme();
  const currentColors = Colors[colorScheme ?? "light"];

  const handleThemeChange = useCallback(
    (changeThema) => {
      setTheme(changeThema);
    },
    [setTheme]
  );

  return (
    <ThemedView style={styles.checkableItemContainer}>
      <CheckableItem
        label={i18n.t("system")}
        value="system"
        selected={theme === "system"}
        onPress={() => handleThemeChange("system")}
        iconColor={currentColors.text}
        iconName="circle.lefthalf.fill"
      />

      <ThemedLine />
      <CheckableItem
        label={i18n.t("light")}
        value="light"
        selected={theme === "light"}
        onPress={() => handleThemeChange("light")}
        iconColor={currentColors.text}
        iconName="sun.max"
      />
      <ThemedLine />
      <CheckableItem
        label={i18n.t("dark")}
        value="dark"
        selected={theme === "dark"}
        onPress={() => handleThemeChange("dark")}
        iconColor={currentColors.text}
        iconName="moon.stars"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  checkableItemContainer: {
    padding: 32,
    flex: 1,
    gap: 20,
  },
  itemWrapper: {
    borderBottomWidth: 0.2,
    borderBottomColor: "#3333",
  },
  item: {
    // flexDirection: "row",
    // alignItems:"center",
  },
});
