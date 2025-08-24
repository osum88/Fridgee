import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { StrictMode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/hooks/useUser";

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
        {/* UserProvider musí být vně LanguageProvider, aby LanguageProvider měl přístup k datům */}
        <UserProvider>
          <LanguageWrapper>
            <RootLayoutContent
              colorScheme={colorScheme}
              CustomDarkTheme={CustomDarkTheme}
            />
          </LanguageWrapper>
        </UserProvider>
      </StrictMode>
    </QueryClientProvider>
  );
}

// Nová komponenta, která obaluje RootLayoutContent a předává data
function LanguageWrapper({ children }) {
  const { user, isAuthenticated } = useUser();
  return (
    <LanguageProvider user={user} isUserLoggedIn={isAuthenticated}>
      {children}
    </LanguageProvider>
  );
}

function RootLayoutContent({ colorScheme, CustomDarkTheme }) {
  const { isLanguageLoaded } = useLanguage();
  const { isLoading, isAuthenticated } = useUser();
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    if (!isLoading && isLanguageLoaded) {
      setIsAppReady(true);
    }
  }, [isLoading, isLanguageLoaded]); 

  useEffect(() => {
    if (isAppReady) {
      if (isAuthenticated) {
        if (isLanguageLoaded) {
          router.replace("/(tabs)");
        }
      } else {
        if (isLanguageLoaded) {
          router.replace("/login");
        }
      }
    }
  }, [isAppReady, isAuthenticated, isLanguageLoaded]); 

  if (!isAppReady) {
    return null;
  }

  return (
    <ThemeProvider
      value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
    >
      <Stack screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="(protected)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
