import React, { useRef, useState, useEffect } from "react";
import { StyleSheet, View, Pressable, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { BaseBottomSheet } from "./BaseBottomSheet";

const CounterModalComponent = ({ visible, action, item, colors, onClose, onConfirm }) => {
  const [count, setCount] = useState(1);

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
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      colors={colors}
      styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
    >
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
    </BaseBottomSheet>
  );
};

export const CounterModal = React.memo(CounterModalComponent);

const styles = StyleSheet.create({
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
});
