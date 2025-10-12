import { useEffect } from "react";
import * as SystemUI from "expo-system-ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useSegments } from "expo-router";

// resi zmenu barvy pod systemovymi tlacitky pri rucnim prepnuti theme
export function useSystemNavigationBarTheme() {
  const { colorScheme, theme } = useTheme();
  const segments = useSegments();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (theme !== "system") {
        if (colorScheme === "dark") {
          const isInTabs = segments.includes("(tabs)");
          const targetColor = isInTabs ? "#1f1f1f" : "#121212";
          SystemUI.setBackgroundColorAsync(targetColor);
        }

        if (colorScheme === "light") {
          SystemUI.setBackgroundColorAsync("#ffffff");
        }
      }
    }, 20); // zpozdeni kvuli animaci

    return () => clearTimeout(timeout);
  }, [segments, colorScheme, theme]);
}
