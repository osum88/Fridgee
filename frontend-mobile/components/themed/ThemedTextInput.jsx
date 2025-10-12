import React from "react";
import { TextInput } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsivePadding } from "@/utils/scale";

export function ThemedTextInput({ style, transparent = false, ...otherProps }) {
  const currentColors = useThemeColor();

  return (
    <TextInput
      style={[
        !transparent && { backgroundColor: currentColors.input },
        {
          fontSize: responsiveFont(13.2),
          color: currentColors.text,
          ...responsivePadding(9),
          borderRadius: responsiveFont(12),
        },
        style,
      ]}
      placeholderTextColor={currentColors.inputText}
      {...otherProps}
    />
  );
}
