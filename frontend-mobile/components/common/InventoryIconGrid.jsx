import React, { useMemo } from "react";
import { View, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { INVENTORY_THEMES } from "@/constants/colors";
import { INVENTORY_ICONS } from "@/constants/inventory";
import { responsiveSize } from "@/utils/scale";

//grid pro ikony inventare
export function InventoryIconGrid({ numColumns = 4, selectedIcon, onSelect, colors }) {
  const { width } = Dimensions.get("window");
  const PADDING_HORIZONTAL = Math.round(responsiveSize.horizontal(20));
  const AVAILABLE_WIDTH = width - PADDING_HORIZONTAL * 2;
  const COLUMN_GAP = Math.round(responsiveSize.moderate(16));
  const ICON_SIZE = (AVAILABLE_WIDTH - COLUMN_GAP * (numColumns - 1)) / numColumns;

  return useMemo(() => (
    <View style={[styles.iconGrid, { gap: COLUMN_GAP, width: AVAILABLE_WIDTH }]}>
      {INVENTORY_ICONS.map((iconName) => {
        const isSelected = selectedIcon === iconName;
        const theme = INVENTORY_THEMES[iconName] || { light: colors.text, dark: colors.text };
        return (
          <TouchableOpacity
            key={iconName}
            onPress={() => onSelect(iconName)}
            style={[
              styles.iconOption,
              { width: ICON_SIZE, height: ICON_SIZE, backgroundColor: colors.cardBackground },
              isSelected && { borderColor: theme.light, borderWidth: 2 },
            ]}
          >
            <IconSymbol
              name={iconName}
              size={responsiveSize.moderate(30)}
              color={isSelected ? theme.light : colors.tabIconDefault}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  ), [selectedIcon, colors, ICON_SIZE, COLUMN_GAP, AVAILABLE_WIDTH, onSelect]);
}

const styles = StyleSheet.create({
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: responsiveSize.vertical(2),
  },
  iconOption: {
    borderRadius: responsiveSize.moderate(13),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});