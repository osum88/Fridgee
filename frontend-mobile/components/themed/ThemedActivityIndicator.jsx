import { ActivityIndicator, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemedActivityIndicator = ({ size, container = false, ...props }) => {
  const colors = useThemeColor();
  const { isDarkTheme } = useTheme();

  return container ? (
    <ThemedView style={styles.container}>
      <ActivityIndicator size={size} color={isDarkTheme ? "white" : colors.primary} {...props} />
    </ThemedView>
  ) : (
    <ActivityIndicator size={size} color={isDarkTheme ? "white" : colors.primary} {...props} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
