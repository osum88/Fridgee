import { ThemedView } from "@/components/themed/ThemedView";
import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";

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
    borderRadius: responsiveSize.moderate(10),
    paddingHorizontal: responsiveSize.horizontal(16),
    paddingVertical: responsiveSize.vertical(5),
    marginVertical: responsiveSize.vertical(7),
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
