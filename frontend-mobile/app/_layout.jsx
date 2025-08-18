import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { StrictMode, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/hooks/useUser";
import { setAccessTokenGetter } from "@/utils/api-client";

//vytvoreni instance TanStack Query
const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

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

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <StrictMode>
        <LanguageProvider>
          <UserProvider>
            <RootLayoutContent
              colorScheme={colorScheme}
              CustomDarkTheme={CustomDarkTheme}
            />
          </UserProvider>
        </LanguageProvider>
      </StrictMode>
    </QueryClientProvider>
  );
}

function RootLayoutContent({ colorScheme, CustomDarkTheme }) {
  const { isLanguageLoaded } = useLanguage();
  const { isLoading, isAuthenticated, getAccessToken } = useUser();

  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
  }, [getAccessToken]);

  if (!isLanguageLoaded || isLoading) {
    return null;
  }

  const stacks = isAuthenticated ? (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(setting)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  ) : (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
    >
      {stacks}
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
