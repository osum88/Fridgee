import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { StrictMode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

//vytvoreni instance TanStack Query
const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: "#1f1f1f",
    },
  };

  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <LanguageProvider>
          <RootLayoutContent
            loaded={loaded}
            colorScheme={colorScheme}
            CustomDarkTheme={CustomDarkTheme}
          />
        </LanguageProvider>
      </StrictMode>
    </QueryClientProvider>
  );
}

function RootLayoutContent({ loaded, colorScheme, CustomDarkTheme }) {
  const { isLanguageLoaded } = useLanguage();

  if (!loaded || !isLanguageLoaded) {
    return null;
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
    >
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(setting)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
