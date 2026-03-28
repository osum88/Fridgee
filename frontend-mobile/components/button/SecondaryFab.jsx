import { Pressable, StyleSheet } from "react-native";
import { BadgedIcon } from "@/components/icons/BadgedIcon";
import { responsiveSize } from "@/utils/scale";

export const SecondaryFab = ({ onPress, color, icons, style }) => (
  <Pressable
    onPress={onPress}
    style={[styles.fabSecondary, { backgroundColor: color.secondButton }, style]}
  >
    <BadgedIcon
      icons={icons}
      size={responsiveSize.moderate(22)}
      color={color.onPrimary}
      lightColorBackground={color.secondButton}
      darkColorBackground={color.secondButton}
    />
  </Pressable>
);

const styles = StyleSheet.create({
  fabSecondary: {
    width: responsiveSize.horizontal(40),
    height: responsiveSize.vertical(40),
    borderRadius: responsiveSize.moderate(12),
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});