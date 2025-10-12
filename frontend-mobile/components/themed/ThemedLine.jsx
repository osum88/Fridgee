import { View, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

export function ThemedLine({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "outline"
  );

  return (
    <View
      style={[{ backgroundColor, height: StyleSheet.hairlineWidth }, style]}
      {...otherProps}
    />
  );
}
