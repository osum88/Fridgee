import { ThemedView } from "@/components/themed/ThemedView";
import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

export function Card({ style, ...props }) {
  const color = useThemeColor();

  return (
    <ThemedView style={[styles.card, style]} darkColor={color.surface}>
       {props.children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderColor: "transparent",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginVertical: 8,
    width: "100%",

    // iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android
    elevation: 3,
  },
});
