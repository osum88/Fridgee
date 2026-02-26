import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { memo } from "react";

function ThemedLineComponent({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "outline");

  return (
    <View style={[{ backgroundColor, height: StyleSheet.hairlineWidth }, style]} {...otherProps} />
  );
}

export const ThemedLine = memo(ThemedLineComponent);
