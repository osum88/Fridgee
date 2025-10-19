import { useState, useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Pressable,
} from "react-native";
import { HelperText, Portal } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export function DropdownMenu({
  value,
  onChange,
  label,
  items = [],
  placeholder,
  isSubmitting,
  inputColor,
  inputStyles,
  error: externalError,
  setError: externalSetError,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownY, setDropdownY] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const dropdownRef = useRef(null);
  const color = useThemeColor();
  const isChanging = useRef(false);
  const [internalError, internalSetError] = useState("");

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;

  const labelPosition = useSharedValue(value ? 1 : 0);
  const translateY = responsiveSize.vertical(-21);
  const prevTranslateY = responsiveSize.vertical(-1);
  const translateX = responsiveSize.vertical(6);
  const prevTranslateX = responsiveSize.vertical(16);

  useEffect(() => {
    if (value) {
      labelPosition.value = withTiming(1, { duration: 300 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  //animace nadpisu
  const animatedLabelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          labelPosition.value,
          [0, 1],
          [prevTranslateY, translateY]
        ),
      },
      {
        translateX: interpolate(
          labelPosition.value,
          [0, 1],
          [prevTranslateX, translateX]
        ),
      },
    ],
  }));

  // kliknuti do dropdown menu
  const handleOpen = () => {
    dropdownRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropdownY(py + height);
      setDropdownX(px);
      setDropdownWidth(width);
      setIsOpen(isSubmitting);
      labelPosition.value = withTiming(1, { duration: 300 });
    });
  };

  //zpracuje vybranou moznost (kvuli animaci to kontroluje mnohonasobne volani)
  const handleSelect = (item) => {
    if (isChanging.current) return;
    isChanging.current = true;

    if (item?.value || value) {
      if (item?.value) {
        onChange(item.value);
      }
      labelPosition.value = withTiming(1, { duration: 300 });
    } else {
      labelPosition.value = withTiming(0, { duration: 300 });
    }
    setError("")
    setIsOpen(false);
    setTimeout(() => {
      isChanging.current = false;
    }, 300);
  };

  if (!inputColor) {
    inputColor = {
      colors: {
        outline: color.fullName,
        background: color.background,
        primary: color.tabsText,
        error: color.error,
        onSurface: color.text,
        onSurfaceVariant: color.inputTextPaper,
      },
    };
  }

  const renderLabel = () => {
    if (value || isOpen) {
      return (
        <Animated.View
          style={[
            styles.labelContainer,
            animatedLabelStyle,
            {
              backgroundColor:
                inputColor?.colors?.background || color.background,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.label,
              {
                color: error
                  ? color.error
                  : isOpen
                    ? inputColor?.colors?.primary || color.tabsText
                    : inputColor?.colors?.onSurfaceVariant ||
                      color.inputTextPaper,
              },
            ]}
          >
            {label}
          </ThemedText>
        </Animated.View>
      );
    }
    return null;
  };

  const selectedLabel =
    items.find((item) => item.value === value)?.label || placeholder;

  return (
    <ThemedView>
      <View ref={dropdownRef} style={{ position: "relative" }}>
        <Pressable
          onPress={handleOpen}
          style={[
            styles.dropdown,
            {
              borderColor: error
                ? color.error
                : isOpen
                  ? inputColor?.colors?.primary || color.tabsText
                  : inputColor?.colors?.outline || color.fullName,
              borderWidth: isOpen || error ? 2 : 1,
            },
            inputStyles,
          ]}
        >
          {renderLabel()}
          <ThemedText
            style={[
              styles.selectedTextStyle,
              {
                color: value
                  ? inputColor?.colors?.onSurface || color.text
                  : inputColor?.colors?.onSurfaceVariant ||
                    color.inputTextPaper,
              },
            ]}
          >
            {selectedLabel}
          </ThemedText>
          <IconSymbol
            name={isOpen ? "chevron.up" : "chevron.down"}
            size={responsiveSize.moderate(22)}
            color={
              error ? color.error : isOpen ? color.tabsText : color.inputIcon
            }
          />
        </Pressable>
      </View>

      {isOpen && (
        <Portal>
          <TouchableWithoutFeedback onPress={handleSelect}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.containerStyle,
              {
                top: dropdownY,
                left: dropdownX,
                width: dropdownWidth,
                backgroundColor: color.whiteAndSurface,
              },
            ]}
          >
            {items.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.item}
                onPress={() => handleSelect(item)}
              >
                <Text style={[styles.itemText, { color: color.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Portal>
      )}
      <HelperText
        type="error"
        visible={error}
        style={{ marginLeft: responsiveSize.horizontal(-9) }}
        theme={inputColor}
      >
        {error}
      </HelperText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: responsiveSize.vertical(41),
    borderRadius: responsiveSize.moderate(7),
    paddingHorizontal: responsiveSize.horizontal(14),
    marginTop: responsiveSize.vertical(5),
    // marginVertical: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelContainer: {
    position: "absolute",
    zIndex: 999,
    paddingHorizontal: responsiveSize.horizontal(6),
  },
  label: {
    fontSize: responsiveFont(11),
  },
  selectedTextStyle: {
    fontSize: responsiveFont(15),
  },
  containerStyle: {
    position: "absolute",
    borderRadius: responsiveSize.moderate(7),
    paddingVertical: responsiveSize.vertical(6),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  item: {
    paddingVertical: responsiveSize.vertical(10),
    paddingHorizontal: responsiveSize.horizontal(16),
  },
  itemText: {
    fontSize: responsiveFont(14),
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
