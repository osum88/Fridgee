import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

export function CheckableItem({
  label,
  value,
  selected,
  onPress,
  iconName,
  iconColor,
  outlineStyle,
  ...props
}) {
  const color = useThemeColor().tint;

  return (
    <TouchableOpacity
      style={[styles.checkableItemContainer, outlineStyle]}
      onPress={() => onPress(value)}
    >
      {iconName && (
        <IconSymbol
          style={styles.icon}
          size={responsiveSize.moderate(20)}
          name={iconName}
          color={iconColor}
        />
      )}
      <ThemedView style={styles.itemContainer}>
        <ThemedText style={styles.text}>{label}</ThemedText>
        {selected && (
          <IconSymbol
            size={responsiveSize.moderate(24)}
            name="checkmark"
            color={color}
            style={styles.iconCheck}
          />
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  checkableItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: responsiveSize.vertical(58),
  },
  itemContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  iconCheck: {
    fontWeight: "bold",
    marginRight: responsiveSize.horizontal(4),
    alignSelf: "center",
  },
  icon: {
    marginRight: responsiveSize.horizontal(14),
  },
  text: {
    flex: 1,
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
  },
});
