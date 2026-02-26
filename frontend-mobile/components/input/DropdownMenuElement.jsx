import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet } from "react-native";
import { useMemo, useRef, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { Dropdown } from "react-native-element-dropdown";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from "react-native-reanimated";
import * as SystemUI from "expo-system-ui";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";

export function DropdownMenu({
  value,
  onChange,
  label,
  isSubmitting,
  items = [],
  placeholder,
  inputColor: externalInputColor,
  inputStyles,
  ...props
}) {
  const [isFocus, setIsFocus] = useState(false);
  const color = useThemeColor();

  const labelPosition = useSharedValue(value ? 1 : 0);
  const isChanging = useRef(false);

  const translateY = responsiveSize.vertical(-8);
  const prevTranslateY = responsiveSize.vertical(13);
  const translateX = responsiveSize.vertical(2);
  const prevTranslateX = responsiveSize.vertical(12);

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(labelPosition.value, [0, 1], [prevTranslateY, translateY]),
        },
        {
          translateX: interpolate(labelPosition.value, [0, 1], [prevTranslateX, translateX]),
        },
        {
          scale: interpolate(labelPosition.value, [0, 1], [1, 0.8]),
        },
      ],
    };
  });

  //kliknuti do dropdown menu
  const handleFocus = () => {
    setIsFocus(true);
    labelPosition.value = withTiming(1, { duration: 200 });
    SystemUI.setBackgroundColorAsync(color.background);
  };

  //zpracuje vybranou moznost (kvuli animaci to kontroluje mnohonasobne volani)
  const handleChange = (item) => {
    if (isChanging.current) return;
    isChanging.current = true;

    if (item?.value || value) {
      if (item?.value) {
        onChange(item.value);
      }
      labelPosition.value = withTiming(1, { duration: 200 });
    } else {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
    setIsFocus(false);

    setTimeout(() => {
      isChanging.current = false;
    }, 300);
  };

  const finalInputColor = useMemo(
    () => externalInputColor || GET_INPUT_THEME_NATIVE_PAPER(color),
    [externalInputColor, color],
  );

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <Animated.View
          style={[
            styles.label,
            animatedLabelStyle,
            {
              backgroundColor: finalInputColor?.colors?.background || color.background,
            },
          ]}
        >
          <ThemedText
            style={[
              isFocus && {
                color: finalInputColor?.colors?.primary || color.tabsText,
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

  return (
    <ThemedView>
      <Dropdown
        style={[
          styles.dropdown,
          {
            borderColor: isFocus
              ? finalInputColor?.colors?.primary || color.tabsText
              : finalInputColor?.colors?.outline || color.fullName,
            borderWidth: isFocus ? 2 : 1,
          },
          inputStyles,
        ]}
        placeholderStyle={[styles.placeholderStyle, { color: color.inputTextPaper }]}
        selectedTextStyle={[styles.selectedTextStyle, { color: color.text }]}
        itemTextStyle={{ color: color.text }}
        containerStyle={[
          {
            backgroundColor: color.whiteAndSurface,
          },
          styles.containerStyle,
        ]}
        activeColor={{ backgroundColor: color.background }}
        mode="default"
        dropdownPosition="bottom"
        data={items}
        labelField="label"
        valueField="value"
        placeholder={!isFocus && placeholder}
        value={value}
        onFocus={handleFocus}
        onBlur={handleChange}
        onChange={handleChange}
        renderRightIcon={() => (
          <IconSymbol
            name={isFocus ? "chevron.up" : "chevron.down"}
            size={responsiveSize.moderate(22)}
            color={isFocus ? finalInputColor?.colors?.primary || color.tabsText : color.inputIcon}
          />
        )}
        {...props}
      />
      {renderLabel()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    height: responsiveSize.vertical(41),
    borderRadius: responsiveSize.moderate(7),
    paddingHorizontal: responsiveSize.horizontal(14),
  },

  label: {
    position: "absolute",
    // left: responsiveSize.horizontal(10),
    // top: responsiveSize.vertical(-6),
    zIndex: 999,
    paddingHorizontal: responsiveSize.horizontal(6),
    fontSize: responsiveSize.moderate(11),
  },
  placeholderStyle: {
    fontSize: responsiveSize.moderate(15),
  },
  selectedTextStyle: {
    fontSize: responsiveSize.moderate(15),
  },
  containerStyle: {
    borderRadius: responsiveSize.moderate(7),
    borderWidth: 0,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});
