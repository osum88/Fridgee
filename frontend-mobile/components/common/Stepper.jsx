import React, { useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize, responsiveFont } from "@/utils/scale";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { HelperText } from "react-native-paper";

// zvysuje a snizuje hodnotu, ktera je mezi min a max, a zobrazuje ji s tlacitky plus a minus
export const Stepper = ({ value, onChange, min = 1, max = 99, label, containerStyle }) => {
  const color = useThemeColor();
  
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const valueRef = useRef(value);

  valueRef.current = value;

  const updateValue = (type) => {
    const currentValue = valueRef.current;
    if (type === "inc" && currentValue < max) {
      onChange(currentValue + 1);
    } else if (type === "dec" && currentValue > min) {
      onChange(currentValue - 1);
    }
  };

  const startAction = (type) => {
    updateValue(type);
    stopAction();

    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        if (type === "inc" && valueRef.current >= max) stopAction();
        else if (type === "dec" && valueRef.current <= min) stopAction();
        else updateValue(type);
      }, 100);
    }, 500);
  };

  const stopAction = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View
        style={[
          styles.stepperWrapper,
          {
            backgroundColor: color.background,
            borderColor: color.fullName,
          },
        ]}
      >
        {label && (
          <View style={[styles.labelContainer, { backgroundColor: color.background }]}>
            <ThemedText style={[styles.label, { color: color.inputTextPaper }]}>{label}</ThemedText>
          </View>
        )}

        <TouchableOpacity
          onPressIn={() => startAction("dec")}
          onPressOut={stopAction}
          style={[styles.button, { backgroundColor: color.stepperButton }]}
        >
          <IconSymbol name={"minus"} size={responsiveSize.moderate(24)} color={color.onPrimary} />
        </TouchableOpacity>

        <ThemedText style={styles.valueText}>{value}</ThemedText>

        <TouchableOpacity
          onPressIn={() => startAction("inc")}
          onPressOut={stopAction}
          style={[styles.button, { backgroundColor: color.stepperButton }]}
        >
          <IconSymbol name={"plus"} size={responsiveSize.moderate(24)} color={color.onPrimary} />
        </TouchableOpacity>
      </View>
      <HelperText
        type="error"
        style={{
          marginLeft: responsiveSize.horizontal(-9),
          marginTop: responsiveSize.vertical(-2),
        }}
      ></HelperText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  stepperWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: responsiveSize.vertical(14),
    paddingHorizontal: responsiveSize.horizontal(16),
    borderRadius: responsiveSize.moderate(7),
    borderWidth: 1,
    position: "relative",
  },
  labelContainer: {
    position: "absolute",
    top: responsiveSize.vertical(-7),
    left: responsiveSize.horizontal(8),
    paddingHorizontal: responsiveSize.horizontal(6),
    zIndex: 1,
  },
  label: {
    fontSize: responsiveFont(15 * 0.75),
    fontWeight: "400",
  },
  button: {
    width: responsiveSize.moderate(42),
    height: responsiveSize.moderate(42),
    borderRadius: responsiveSize.moderate(22.5),
    justifyContent: "center",
    alignItems: "center",
  },
  valueText: {
    fontSize: responsiveFont(28),
    fontWeight: "500",
  },
});
