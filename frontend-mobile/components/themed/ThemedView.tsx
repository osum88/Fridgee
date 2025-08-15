import { View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  safe?: boolean;
};

export function ThemedView({ style, safe = false, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background");
  const insets = useSafeAreaInsets()
  if (!safe) {
    return <View style={[{ backgroundColor }, style]} {...otherProps} />;
  }

  return <View style={[{ backgroundColor, paddingTop: insets.top, paddingBottom: insets.bottom }, style]} {...otherProps} />;
}
