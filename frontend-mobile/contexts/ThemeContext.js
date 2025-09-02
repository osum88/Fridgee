import { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColorScheme, View } from "react-native";

const ThemeContext = createContext();

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState("system");
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  //nacteni barvy
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("app-theme");
        if (savedTheme) {
          setTheme(savedTheme);
        }
      } catch (error) {
        console.error("Failed to load theme from storage", error);
      } finally {
        setIsThemeLoaded(true);
      }
    };
    loadTheme();
  }, []);

  // ulozeni tematu do storage pri zmene
  useEffect(() => {
    if (isThemeLoaded) {
      const saveTheme = async () => {
        try {
          await AsyncStorage.setItem("app-theme", theme);
        } catch (error) {
          console.error("Failed to save theme to storage", error);
        }
      };
      saveTheme();
    }
  }, [theme, isThemeLoaded]);

  const colorScheme = theme === "system" ? systemColorScheme : theme;
  const value = { theme, setTheme, colorScheme, isThemeLoaded };

  if (!isThemeLoaded) {
    const splashColor = colorScheme === "dark" ? "black" : "white";
    return <View style={{ flex: 1, backgroundColor: splashColor }} />;
  }
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
