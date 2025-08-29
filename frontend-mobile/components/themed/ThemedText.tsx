import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

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
      style={[
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
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
  checkableItem: {
    fontSize: 16,
    lineHeight: 30,
    fontWeight: "600",
  },
  btn: {
    fontSize: 18,
    fontWeight: "bold",
  },
  loading: {
    fontSize: 27,
    fontWeight: "400",
  },
  error: {
    fontSize: 12.5,
  },
  fullName: {
    fontSize: 14,
    lineHeight: 18,
  },
});
