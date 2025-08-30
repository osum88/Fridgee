import React from "react";
import { TextInput } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";


export function ThemedTextInput({ style, transparent = false, ...otherProps }) {
  const currentColors = useThemeColor()

  return (
    <TextInput
      style={[
        !transparent && { backgroundColor: currentColors.input },
        {
          color: currentColors.text,
          padding: 10,
          borderRadius: 12,
        },
        style,
      ]}
      placeholderTextColor={currentColors.input_text}
      {...otherProps}
    />
  );
}
