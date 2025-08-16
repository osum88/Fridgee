import { useThemeColor } from "@/hooks/useThemeColor";
import { Checkbox } from "expo-checkbox";

export function ThemedCheckbox({
  lightColor,
  darkColor,
  value,
  ...otherProps
}) {
  const schemaColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "primary"
  );
  const uncheckedColor = useThemeColor("text");

  const checkboxColor = value ? schemaColor : uncheckedColor;

  return <Checkbox value={value} color={checkboxColor} {...otherProps} />;
}
