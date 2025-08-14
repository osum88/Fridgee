import { View } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";


export function ThemedLine({ style, lightColor, darkColor, ...otherProps }) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "outline");

  return <View style={[{ backgroundColor, height: 0.2 }, style]} {...otherProps} />;
}



