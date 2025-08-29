import React from "react";
import { TextInput } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function ThemedTextInput({ style, transparent = false, ...otherProps }) {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];

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
