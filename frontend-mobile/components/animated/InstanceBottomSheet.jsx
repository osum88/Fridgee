import React, { useRef } from "react";
import { StyleSheet, View, Pressable, Modal, Animated, Platform } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useTheme } from "@/contexts/ThemeContext";


const ACTIONS = [
  { key: "remove1", icon: "trash", color: "error" },
  { key: "edit", icon: "pencil", color: "orange" },
  { key: "consume", icon: "checkmark.circle", color: "primary" },
  { key: "add", icon: "plus.circle", color: "validCount" },
];

const InstanceBottomSheetComponent = ({ visible, item, colors, onClose, onAction }) => {
  const translateY = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useTheme();

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 200, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!item) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarColor={colorScheme === "dark" ? "#1f1f1f" : "#ffffff"}
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { backgroundColor: colors.background, transform: [{ translateY }] }]}
      >
        <View style={[styles.sheetHandle, { backgroundColor: colors.text + "22" }]} />

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
        <View style={styles.sheetBottom} />
      </Animated.View>
    </Modal>
  );
};

export const InstanceBottomSheet = React.memo(InstanceBottomSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: responsiveSize.moderate(20),
    borderTopRightRadius: responsiveSize.moderate(20),
    paddingTop: responsiveSize.vertical(10),
  },
  sheetHandle: {
    width: responsiveSize.horizontal(36),
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: responsiveSize.vertical(18),
  },
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
  sheetBottom: {
    height: Platform.OS === "ios" ? responsiveSize.vertical(32) : responsiveSize.vertical(18),
    marginTop: responsiveSize.vertical(2),
  },
});
