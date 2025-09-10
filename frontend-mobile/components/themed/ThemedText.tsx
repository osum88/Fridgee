import { StyleSheet, Text, type TextProps } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  responsiveFont,
  responsiveVertical,
  responsiveSize,
} from "@/utils/scale";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?:
    | "default"
    | "title"
    | "defaultSemiBold"
    | "subtitle"
    | "link"
    | "checkableItem"
    | "btn"
    | "loading"
    | "fullName"
    | "error";
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}: ThemedTextProps) {
  let color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const colorError = useThemeColor(
    { light: undefined, dark: undefined },
    "error"
  );
  const colorFullName = useThemeColor(
    { light: undefined, dark: undefined },
    "fullName"
  );

  if (type === "error") {
    color = colorError;
  } else if (type === "fullName") {
    color = colorFullName;
  }

  return (
    <Text
      allowFontScaling={false}
      style={[
        { includeFontPadding: false },
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        type === "checkableItem" ? styles.checkableItem : undefined,
        type === "btn" ? styles.btn : undefined,
        type === "loading" ? styles.loading : undefined,
        type === "error" ? styles.error : undefined,
        type === "fullName" ? styles.fullName : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: responsiveFont(15),
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: responsiveFont(30),
    fontWeight: "bold",
    
  },
  subtitle: {
    fontSize: responsiveFont(18),
    fontWeight: "bold",
  },
  link: {
    lineHeight: responsiveVertical(28),
    fontSize: responsiveFont(14),
    color: "#0a7ea4",
  },
  checkableItem: {
    fontSize: responsiveFont(14),
    fontWeight: "600",
  },
  btn: {
    fontSize: responsiveFont(17),
    fontWeight: "bold",
  },
  loading: {
    fontSize: responsiveFont(25),
    fontWeight: "400",
  },
  error: {
    fontSize: responsiveFont(11.5),
  },
  fullName: {
    fontSize: responsiveFont(13),
  },
});
