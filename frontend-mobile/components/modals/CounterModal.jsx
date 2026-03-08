import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
} from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useTheme } from "@/contexts/ThemeContext";

const CounterModalComponent = ({ visible, action, item, colors, onClose, onConfirm }) => {
  const translateY = useRef(new Animated.Value(300)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [count, setCount] = useState(1);
  const { colorScheme } = useTheme();

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const countRef = useRef(count);
  countRef.current = count;

  const isRemove = action === "remove1";
  const maxCount = isRemove ? (item?.count ?? 1) : 99;
  const accentColor = isRemove ? colors.error : colors.validCount;

  //pri zobrazeni se nastavi na 1
  useEffect(() => {
    if (visible) setCount(1);
  }, [visible]);

  useEffect(() => {
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
        Animated.timing(translateY, { toValue: 300, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const updateValue = (type) => {
    if (type === "inc" && countRef.current < maxCount) {
      setCount((c) => c + 1);
    } else if (type === "dec" && countRef.current > 1) {
      setCount((c) => c - 1);
    }
  };

  const stopAction = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startAction = (type) => {
    updateValue(type);
    stopAction();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (type === "inc" && countRef.current >= maxCount) stopAction();
        else if (type === "dec" && countRef.current <= 1) stopAction();
        else updateValue(type);
      }, 100);
    }, 500);
  };

  //reakce na tlacitko
  const handleConfirm = () => {
    const foodInstanceId =
      action === "add"
        ? item.instanceIds[0]
        : item?.instanceIds.slice(item.instanceIds.length - count);
    onConfirm(action, { data: { foodInstanceId: foodInstanceId, count: count } });
    onClose();
  };

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
        <View style={[styles.handle, { backgroundColor: colors.text + "22" }]} />

        {/* counter */}
        <View style={styles.counterRow}>
          {/* minus */}
          <TouchableOpacity
            onPressIn={() => startAction("dec")}
            onPressOut={stopAction}
            style={[
              styles.counterBtn,
              { backgroundColor: colors.surface, opacity: count <= 1 ? 0.4 : 1 },
            ]}
            disabled={count <= 1}
          >
            <IconSymbol name="minus" size={responsiveSize.moderate(20)} color={accentColor} />
          </TouchableOpacity>

          {/* cislo */}
          <View style={[styles.countDisplay, { borderColor: accentColor + "88" }]}>
            <ThemedText style={[styles.countText, { color: accentColor }]}>{count}</ThemedText>
            {isRemove && item?.count > 1 && (
              <ThemedText style={[styles.countMax, { color: colors.text + "44" }]}>
                / {item.count}
              </ThemedText>
            )}
          </View>

          {/* plus */}
          <TouchableOpacity
            onPressIn={() => startAction("inc")}
            onPressOut={stopAction}
            style={[
              styles.counterBtn,
              { backgroundColor: colors.surface, opacity: count >= maxCount ? 0.4 : 1 },
            ]}
            disabled={count >= maxCount}
          >
            <IconSymbol name="plus" size={responsiveSize.moderate(20)} color={accentColor} />
          </TouchableOpacity>
        </View>

        {/* tlacitko */}
        <Pressable
          onPress={handleConfirm}
          style={[styles.confirmBtn, { backgroundColor: accentColor }]}
        >
          <IconSymbol
            name={isRemove ? "trash" : "plus.circle"}
            size={responsiveSize.moderate(18)}
            color="#fff"
          />
          <ThemedText style={styles.confirmText}>
            {i18n.t(isRemove ? "remove1" : "add")} {count}
            {"\u00d7"}
          </ThemedText>
        </Pressable>

        <View style={styles.bottom} />
      </Animated.View>
    </Modal>
  );
};

export const CounterModal = React.memo(CounterModalComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: responsiveSize.moderate(20),
    borderTopRightRadius: responsiveSize.moderate(20),
    paddingTop: responsiveSize.vertical(10),
    paddingHorizontal: responsiveSize.horizontal(20),
  },
  handle: {
    width: responsiveSize.horizontal(36),
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: responsiveSize.vertical(24),
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(16),
    marginBottom: responsiveSize.vertical(28),
  },
  counterBtn: {
    width: responsiveSize.moderate(48),
    height: responsiveSize.moderate(48),
    borderRadius: responsiveSize.moderate(14),
    justifyContent: "center",
    alignItems: "center",
  },
  countDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: responsiveSize.horizontal(4),
    minWidth: responsiveSize.horizontal(80),
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: responsiveSize.moderate(12),
    paddingHorizontal: responsiveSize.horizontal(16),
    paddingVertical: responsiveSize.vertical(8),
  },
  countText: {
    fontSize: responsiveSize.moderate(28),
    fontWeight: "700",
    lineHeight: responsiveSize.moderate(34),
  },
  countMax: {
    fontSize: responsiveSize.moderate(14),
    fontWeight: "400",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(8),
    height: responsiveSize.vertical(50),
    borderRadius: responsiveSize.moderate(14),
  },
  confirmText: {
    color: "#fff",
    fontSize: responsiveSize.moderate(16),
    fontWeight: "600",
  },
  bottom: {
    height: Platform.OS === "ios" ? responsiveSize.vertical(32) : responsiveSize.vertical(18),
    marginTop: responsiveSize.vertical(6),
  },
});
