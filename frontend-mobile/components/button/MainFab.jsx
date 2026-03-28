import { Pressable, StyleSheet } from "react-native";
import { BadgedIcon } from "@/components/icons/BadgedIcon";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";

export const MainFab = ({ onPress, color, hasContent = false }) => (
  <Pressable onPress={onPress} style={[styles.fabMain, { backgroundColor: color.primary }]}>
    {hasContent ? (
      <BadgedIcon
        icons={["barcode.viewfinder", "plus"]}
        size={responsiveSize.moderate(30)}
        color={color.onPrimary}
        lightColorBackground={color.primary}
        darkColorBackground={color.primary}
      />
    ) : (
      <IconSymbol name="plus" size={responsiveSize.moderate(38)} color={color.onPrimary} />
    )}
  </Pressable>
);

const styles = StyleSheet.create({
  fabMain: {
    width: responsiveSize.horizontal(56),
    height: responsiveSize.vertical(56),
    borderRadius: responsiveSize.moderate(18),
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});