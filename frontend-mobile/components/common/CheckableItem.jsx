import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";

import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";


export function CheckableItem({ label, value, selected, onPress, iconName, iconColor, ...props }) {
  const color = useThemeColor().tint;

  return (
    <TouchableOpacity
      style={styles.checkableItemContainer}
      onPress={() => onPress(value)}
    >
      {iconName && <IconSymbol style={styles.icon} size={28} name={iconName} color={iconColor} />}
      <ThemedView style={styles.itemContainer}>
        <ThemedText type="checkableItem">{label}</ThemedText>
        {selected && (
          <IconSymbol
            size={26}
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
  },
  itemContainer: {
    justifyContent: "space-between",
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
  },
  iconCheck: {
    fontWeight: "bold",
  },
  icon: {
    marginEnd: 10,
  },
});
