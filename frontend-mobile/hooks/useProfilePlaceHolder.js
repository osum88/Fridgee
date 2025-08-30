import { useTheme } from "@/contexts/ThemeContext";

export function useProfilePlaceHolder() {
  const { colorScheme } = useTheme();

  const imageSource =
    colorScheme === "light"
      ? require("@/assets/images/place-holder/apple-placeholder-light.png")
      : require("@/assets/images/place-holder/apple-placeholder-dark.png");

  return imageSource;
}
