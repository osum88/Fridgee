import React from "react";
import { TextInput } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function ThemedTextInput({ style, ...otherProps }) {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];

  return (
    <TextInput
      style={[
        {
          backgroundColor: currentColors.input,
          color: currentColors.text,
          padding: 10,
          borderRadius: 8,
        },
        style,
      ]}
      placeholderTextColor={currentColors.input_text}
      {...otherProps}
    />
  );
}
