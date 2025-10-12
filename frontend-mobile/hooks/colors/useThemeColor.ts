import { Colors } from "@/constants/Colors";
import { useTheme } from "@/contexts/ThemeContext";

type Theme = "light" | "dark";
type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;
type ColorsType = typeof Colors.light;

export function useThemeColor(): ColorsType;
export function useThemeColor(colorName: ColorName): string;
export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName?: ColorName
): string;

export function useThemeColor(
  arg1?: ColorName | { light?: string; dark?: string },
  arg2?: ColorName
) {
  const { colorScheme } = useTheme();
  const theme: Theme = (colorScheme ?? "light") as Theme;

  if (!arg1) {
    return Colors[theme];
  }

  if (typeof arg1 === "string") {
    return Colors[theme][arg1];
  }

  if (arg1[theme]) {
    return arg1[theme];
  }

  if (arg2) {
    return Colors[theme][arg2];
  }
  return Colors[theme].text;
}
