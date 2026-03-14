import React, { useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { getUnitLabel } from "@/utils/stringUtils";
import { BaseBottomSheet } from "./BaseBottomSheet";

const ConsumeModalComponent = ({ visible, item, colors, onClose, onConfirm }) => {
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const countRef = useRef(1);

  const [count, setCount] = useState(1);
  const [amountInput, setAmountInput] = useState("");

  const accentColor = colors.primary;

  const hasAmount = !!item?.amount && item.amount > 0;
  const maxCount = item?.count ?? 1;
  const totalAmount = item?.amount ?? 0;
  const unit = item?.unit
    ? item?.unit === "MULTIPACK"
      ? i18n.t("pcs")
      : getUnitLabel(item?.unit, item.amount)
    : "";
  const amountLabel = item?.unit === "MULTIPACK" ? i18n.t("multipackQuantity") : i18n.t("amount");

  countRef.current = count;

  // reset při otevreni
  useEffect(() => {
    if (visible) {
      setCount(1);
      setAmountInput(hasAmount ? String(totalAmount) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const updateCount = (type) => {
    if (type === "inc" && countRef.current < maxCount) setCount((c) => c + 1);
    else if (type === "dec" && countRef.current > 1) setCount((c) => c - 1);
  };

  const stopAction = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const startAction = (type) => {
    updateCount(type);
    stopAction();
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (type === "inc" && countRef.current >= maxCount) stopAction();
        else if (type === "dec" && countRef.current <= 1) stopAction();
        else updateCount(type);
      }, 100);
    }, 500);
  };

  // Amount validace
  const parsedAmount = parseFloat(amountInput?.replace(",", "."));
  const amountValid =
    !hasAmount ||
    !amountInput ||
    (!isNaN(parsedAmount) && parsedAmount >= 0 && parsedAmount <= totalAmount);
  const isPartialConsume = hasAmount && !isNaN(parsedAmount) && parsedAmount < totalAmount;

  const handleConfirm = () => {
    Keyboard.dismiss();
    const amountToConsume = hasAmount ? { amountToConsume: parsedAmount || 0 } : {};
    const foodInstanceId = item?.instanceIds.slice(item.instanceIds.length - count);
    onConfirm({ data: { foodInstanceId, ...amountToConsume } });
    onClose();
  };

  const handleSetAll = () => {
    setAmountInput(String(totalAmount));
  };

  if (!item) return null;

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      colors={colors}
      styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
    >
      {/* minus */}
      <View style={styles.counterRow}>
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
        <View style={[styles.countDisplay, { borderColor: accentColor + "33" }]}>
          <ThemedText style={[styles.countText, { color: accentColor }]}>{count}</ThemedText>
          {maxCount > 1 && (
            <ThemedText style={[styles.countMax, { color: colors.text + "44" }]}>
              / {maxCount}
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

      {/* amount sekce (pokud existuje) */}
      {hasAmount && (
        <>
          <View style={styles.amountHeader}>
            <ThemedText style={[styles.sectionLabel, { color: colors.text + "77" }]}>
              {amountLabel}
            </ThemedText>
            <Pressable onPress={handleSetAll} hitSlop={8}>
              <ThemedText style={[styles.setAllBtn, { color: accentColor }]}>
                {i18n.t("total")} ({totalAmount} {unit})
              </ThemedText>
            </Pressable>
          </View>

          <View
            style={[
              styles.amountInputWrapper,
              {
                borderColor: amountValid ? accentColor : colors.error,
                backgroundColor: colors.background,
              },
            ]}
          >
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amountInput}
              onChangeText={setAmountInput}
              keyboardType="decimal-pad"
              placeholderTextColor={colors.text + "44"}
              placeholder={String(totalAmount)}
              selectionColor={accentColor}
            />
            <ThemedText style={[styles.unitLabel, { color: colors.text + "66" }]}>
              {unit}
            </ThemedText>
          </View>

          {/* castecne spotrebovani */}
          {isPartialConsume && amountValid && (
            <ThemedText style={[styles.partialNote, { color: colors.text + "85" }]}>
              {i18n.t("remainingAmount", {
                remainingAmount: (totalAmount - parsedAmount).toFixed(2),
                unit,
              })}
            </ThemedText>
          )}

          {!amountValid && amountInput.length > 0 && (
            <ThemedText style={[styles.partialNote, { color: colors.error }]}>
              {i18n.t("amountExceeds", { max: totalAmount, unit })}
            </ThemedText>
          )}
        </>
      )}

      {/* tlacitko */}
      <Pressable
        onPress={handleConfirm}
        style={[
          styles.confirmBtn,
          { backgroundColor: amountValid ? accentColor : colors.text + "22" },
        ]}
        disabled={!amountValid}
      >
        <IconSymbol name="checkmark.circle" size={responsiveSize.moderate(18)} color="#fff" />
        <ThemedText style={styles.confirmText}>
          {i18n.t("consume")} {count}
          {"\u00d7"}
        </ThemedText>
      </Pressable>
    </BaseBottomSheet>
  );
};

export const ConsumeModal = React.memo(ConsumeModalComponent);

const styles = StyleSheet.create({
  sectionLabel: {
    fontSize: responsiveSize.moderate(11),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(16),
    marginBottom: responsiveSize.vertical(22),
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
  amountHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSize.vertical(8),
  },
  setAllBtn: {
    fontSize: responsiveSize.moderate(12),
    fontWeight: "500",
  },
  amountInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: responsiveSize.moderate(12),
    paddingHorizontal: responsiveSize.horizontal(14),
    height: responsiveSize.vertical(50),
    marginBottom: responsiveSize.vertical(8),
  },
  amountInput: {
    flex: 1,
    fontSize: responsiveSize.moderate(18),
    fontWeight: "500",
    padding: 0,
  },
  unitLabel: {
    fontSize: responsiveSize.moderate(14),
    fontWeight: "400",
    marginLeft: responsiveSize.horizontal(6),
  },
  partialNote: {
    fontSize: responsiveSize.moderate(11),
    marginBottom: responsiveSize.vertical(2),
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(8),
    height: responsiveSize.vertical(50),
    borderRadius: responsiveSize.moderate(14),
    marginTop: responsiveSize.vertical(10),
  },
  confirmText: {
    color: "#fff",
    fontSize: responsiveSize.moderate(16),
    fontWeight: "600",
  },
});
