import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "@/constants/translations";
import "react-native-reanimated";
import { useEffect, useState } from "react";

import { useColorScheme } from "@/hooks/useColorScheme";
import { LanguageProvider } from "@/contexts/LanguageContext"; 
import { Colors } from "@/constants/Colors"; // Import Colors

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false);

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("selected_language");
        if (storedLanguage) {
          i18n.locale = storedLanguage;
        }
      } catch (error) {
        console.error("Error loading language from storage:", error);
      } finally {
        setIsLanguageLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  if (!loaded || !isLanguageLoaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: '#1f1f1f',
    },
  };


  return (
    <LanguageProvider> 
      <ThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(setting)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </LanguageProvider>
  );
}
