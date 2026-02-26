import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { HelperText, Portal } from "react-native-paper";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Easing,
} from "react-native-reanimated";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";

import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";

function DropdownMenuComponent({
  value,
  onChange,
  label,
  items = [],
  placeholder,
  isSubmitting = true,
  inputColor: externalInputColor,
  inputStyles,
  showError = true,
  maxHeight = 200,
  paddingRightIcon = responsiveSize.horizontal(14),
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
  const [labelWidth, setLabelWidth] = useState(0);

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;

  const labelPosition = useSharedValue(value ? 1 : 0);
  const targetTranslateY = responsiveSize.vertical(-21);
  const targetTranslateX = responsiveSize.horizontal(5);
  const initialTranslateX = responsiveSize.horizontal(12);

  // funkce pro zachyceni sirky
  const onLabelLayout = (event) => {
    const { width } = event.nativeEvent.layout;
    if (width !== labelWidth) setLabelWidth(width);
  };

  // konfigurace plynule animace
  const timingConfig = {
    duration: 400,
    easing: Easing.out(Easing.exp),
  };

  useEffect(() => {
    labelPosition.value = withTiming(value || isOpen ? 1 : 0, timingConfig);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isOpen]);

  //animace nadpisu
  const animatedLabelStyle = useAnimatedStyle(() => {
    const scale = interpolate(labelPosition.value, [0, 1], [1, 0.75]);
    const compensation = (labelWidth * (1 - scale)) / 2;

    return {
      transform: [
        {
          translateY: interpolate(labelPosition.value, [0, 1], [0, targetTranslateY]),
        },
        {
          translateX: interpolate(
            labelPosition.value,
            [0, 1],
            [initialTranslateX, targetTranslateX - compensation],
          ),
        },
        {
          scale: scale,
        },
      ],
    };
  }, [labelWidth]);

  // kliknuti do dropdown menu
  const handleOpen = useCallback(() => {
    if (!isSubmitting) return;
    dropdownRef.current?.measure((fx, fy, width, height, px, py) => {
      setDropdownY(py + height);
      setDropdownX(px);
      setDropdownWidth(width);
      setIsOpen(true);
    });
  }, [isSubmitting]);

  //zpracuje vybranou moznost (kvuli animaci to kontroluje mnohonasobne volani)
  const handleSelect = useCallback(
    (item) => {
      if (isChanging.current) return;
      isChanging.current = true;

      if (item?.value) {
        onChange(item.value);
      }

      setError("");
      setIsOpen(false);

      setTimeout(() => {
        isChanging.current = false;
      }, 300);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onChange, items, setError],
  );

  const finalInputColor = useMemo(
    () => externalInputColor || GET_INPUT_THEME_NATIVE_PAPER(color),
    [externalInputColor, color],
  );

  //zobrazeny text
  const selectedLabel = useMemo(() => {
    const selectedItem = items.find((item) => item.value === value);
    if (selectedItem) return selectedItem.label;
    return isOpen ? placeholder || "" : "";
  }, [items, value, placeholder, isOpen]);

  return (
    <ThemedView>
      <View ref={dropdownRef} style={{ position: "relative" }}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.labelContainer,
            animatedLabelStyle,
            {
              backgroundColor: finalInputColor?.colors?.background || color.background,
            },
          ]}
        >
          <ThemedText
            onLayout={onLabelLayout}
            style={[
              styles.label,
              {
                color: error
                  ? color.error
                  : isOpen
                    ? finalInputColor?.colors?.primary || color.tabsText
                    : finalInputColor?.colors?.onSurfaceVariant || color.inputTextPaper,
              },
            ]}
          >
            {label}
          </ThemedText>
        </Animated.View>

        <Pressable
          onPress={handleOpen}
          style={[
            styles.dropdown,
            {
              borderColor: error
                ? color.error
                : isOpen
                  ? finalInputColor?.colors?.primary || color.tabsText
                  : finalInputColor?.colors?.outline || color.fullName,
              borderWidth: isOpen || error ? 2 : 1,
              paddingRight: paddingRightIcon,
            },
            inputStyles,
          ]}
        >
          <ThemedText
            numberOfLines={1}
            style={[
              styles.selectedTextStyle,
              {
                color: value
                  ? finalInputColor?.colors?.onSurface || color.text
                  : finalInputColor?.colors?.onSurfaceVariant || color.inputTextPaper,
              },
            ]}
          >
            {selectedLabel}
          </ThemedText>
          <IconSymbol
            name={isOpen ? "chevron.up" : "chevron.down"}
            size={responsiveSize.moderate(21)}
            color={error ? color.error : isOpen ? color.tabsText : color.inputIcon}
          />
        </Pressable>
      </View>

      {isOpen && (
        <Portal>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
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
                maxHeight: responsiveSize.vertical(maxHeight),
              },
            ]}
          >
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
              indicatorStyle={color.dark ? "white" : "black"}
            >
              {items.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={styles.item}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={[styles.itemText, { color: color.text }]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Portal>
      )}

      {showError && (
        <HelperText type="error" visible={!!error} style={styles.helper} theme={finalInputColor}>
          {error}
        </HelperText>
      )}
    </ThemedView>
  );
}
export const DropdownMenu = memo(DropdownMenuComponent);

const styles = StyleSheet.create({
  dropdown: {
    height: responsiveSize.vertical(43),
    borderRadius: responsiveSize.moderate(7),
    paddingLeft: responsiveSize.horizontal(14),
    marginTop: responsiveSize.vertical(5),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  labelContainer: {
    position: "absolute",
    zIndex: 999,
    paddingHorizontal: responsiveSize.horizontal(8),
    top: responsiveSize.vertical(18),
  },
  label: {
    fontSize: responsiveFont(15),
  },
  selectedTextStyle: {
    fontSize: responsiveFont(15),
    flex: 1,
  },
  containerStyle: {
    position: "absolute",
    borderRadius: responsiveSize.moderate(7),
    paddingVertical: responsiveSize.vertical(4),
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 2000,
    overflow: "hidden",
  },
  item: {
    paddingVertical: responsiveSize.vertical(12),
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
    backgroundColor: "transparent",
  },
  helper: {
    marginLeft: responsiveSize.horizontal(-9),
    marginTop: responsiveSize.vertical(-2),
  },
});
