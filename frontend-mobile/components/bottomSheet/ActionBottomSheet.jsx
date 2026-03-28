import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { BaseBottomSheet } from "./BaseBottomSheet";

const ActionBottomSheetComponent = ({ visible, item, colors, onClose, onAction, action }) => {
  if (!item) return null;

  return (
    <BaseBottomSheet visible={visible} onClose={onClose} colors={colors}>
      <View style={styles.sheetActions}>
        {action?.map((action) => (
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
            <ThemedText
              style={[
                styles.sheetActionLabel,
                { color: colors.text + "99", fontSize: responsiveSize.moderate(action?.labelSize || 11) },
              ]}
            >
              {i18n.t(action.key)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </BaseBottomSheet>
  );
};

export const ActionBottomSheet = React.memo(ActionBottomSheetComponent);

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
    fontWeight: "500",
  },
});
