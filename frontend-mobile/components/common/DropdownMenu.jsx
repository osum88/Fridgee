import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { Dropdown } from "react-native-element-dropdown";

export function DropdownMenu({
  value,
  onChange,
  label,
  isSubmitting,
  items = [],
  placeholder,
  inputColor,
  inputStyles,
  ...props
}) {
  const [isFocus, setIsFocus] = useState(false);

  const color = useThemeColor();

  if (!inputColor) {
    inputColor = {
      colors: {
        outline: color.fullName,
        background: color.background,
        primary: color.tabsText,
        error: color.error,
      },
    };
  }

  const renderLabel = () => {
    if (value || isFocus) {
      return (
        <ThemedText
          style={[
            styles.label,
            {
              backgroundColor:
                inputColor?.colors?.background || color.background,
            },
            isFocus && {
              color: inputColor?.colors?.primary || color.tabsText,
            },
          ]}
        >
          {label}
        </ThemedText>
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
              ? inputColor?.colors?.primary || color.tabsText
              : inputColor?.colors?.outline || color.fullName,
            borderWidth: isFocus ? 2 : 1,
          },
          inputStyles,
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        itemTextStyle={{ color: color.text }}
        containerStyle={[
          {
            backgroundColor: color.whiteAndSurface,
          },
          styles.containerStyle,
        ]}
        activeColor={{ backgroundColor: color.background }}
        data={items}
        labelField="label"
        valueField="value"
        placeholder={!isFocus && placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          onChange(item.value);
          setIsFocus(false);
        }}
        renderRightIcon={() => (
          <IconSymbol
            name={isFocus ? "chevron.up" : "chevron.down"}
            size={responsiveSize.moderate(22)}
            color={
              isFocus
                ? inputColor?.colors?.primary || color.tabsText
                : color.inputIcon
            }
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
    left: responsiveSize.horizontal(10),
    top: responsiveSize.vertical(-6),
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
