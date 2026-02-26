import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { Checkbox } from "expo-checkbox";
import { memo } from "react";

function ThemedCheckboxComponent({ lightColor, darkColor, value, ...otherProps }) {
  const schemaColor = useThemeColor({ light: lightColor, dark: darkColor }, "primary");
  const uncheckedColor = useThemeColor("text");

  const checkboxColor = value ? schemaColor : uncheckedColor;

  return <Checkbox value={value} color={checkboxColor} {...otherProps} />;
}

export const ThemedCheckbox = memo(ThemedCheckboxComponent);
