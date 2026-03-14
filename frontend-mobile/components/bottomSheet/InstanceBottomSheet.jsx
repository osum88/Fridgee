import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { BaseBottomSheet } from "./BaseBottomSheet";

const ACTIONS = [
  { key: "remove1", icon: "trash", color: "error" },
  { key: "edit", icon: "pencil", color: "orange" },
  { key: "consume", icon: "checkmark.circle", color: "primary" },
  { key: "add", icon: "plus.circle", color: "validCount" },
];

const InstanceBottomSheetComponent = ({ visible, item, colors, onClose, onAction }) => {
  if (!item) return null;

  return (
    <BaseBottomSheet visible={visible} onClose={onClose} colors={colors}>
      <View style={styles.sheetActions}>
        {ACTIONS.map((action) => (
          <Pressable
            key={action.key}
            style={styles.sheetAction}
            onPress={() => {
              onAction(action.key, item);
              onClose();
            }}
            hitSlop={8}
          >
            <IconSymbol
              name={action.icon}
              size={responsiveSize.moderate(20)}
              color={colors[action.color]}
            />
            <ThemedText style={[styles.sheetActionLabel, { color: colors.text + "99" }]}>
              {i18n.t(action.key)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </BaseBottomSheet>
  );
};

export const InstanceBottomSheet = React.memo(InstanceBottomSheetComponent);

const styles = StyleSheet.create({
  sheetActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: responsiveSize.horizontal(8),
  },
  sheetAction: {
    alignItems: "center",
    gap: responsiveSize.vertical(6),
    flex: 1,
  },
  sheetActionLabel: {
    fontSize: responsiveSize.moderate(11),
    fontWeight: "500",
  },
});
