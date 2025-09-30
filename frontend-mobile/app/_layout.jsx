import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { StrictMode, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/hooks/useUser";
import { View } from "react-native";
import { Provider } from "react-native-paper";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

//vytvoreni instance TanStack Query
const queryClient = new QueryClient();
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: "#1f1f1f",
    },
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      {/* <StrictMode> */}
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <LanguageWrapper>
            <ThemeProvider>
              <Provider>
                <RootLayoutContent CustomDarkTheme={CustomDarkTheme} />
              </Provider>
            </ThemeProvider>
          </LanguageWrapper>
        </UserProvider>
      </GestureHandlerRootView>
      {/* </StrictMode> */}
    </QueryClientProvider>
  );
}

// obaluje RootLayoutContent a predava data
function LanguageWrapper({ children }) {
  const { user, isAuthenticated } = useUser();
  return (
    <LanguageProvider user={user} isUserLoggedIn={isAuthenticated}>
      {children}
    </LanguageProvider>
  );
}

function RootLayoutContent({ CustomDarkTheme }) {
  const { isLanguageLoaded } = useLanguage();
  const { isLoading, isAuthenticated } = useUser();
  const [isAppReady, setIsAppReady] = useState(false);
  const { colorScheme, isThemeLoaded } = useTheme();

  useEffect(() => {
    if (!isLoading && isLanguageLoaded && isThemeLoaded) {
      setIsAppReady(true);
    }
  }, [isLoading, isLanguageLoaded, isThemeLoaded]);

  useEffect(() => {
    if (isAppReady) {
      if (isLanguageLoaded) {
        // try {
        //   router.dismissAll();
        // } catch {}

        if (isAuthenticated) {
          router.replace("/(tabs)");
        } else {
          router.replace("/login");
        }
      }
    }
  }, [isAppReady, isAuthenticated, isLanguageLoaded]);

  if (!isAppReady) {
    return null;
  }

  const backgroundColor = colorScheme === "dark" ? "#000000" : "#ffffff";

  return (
    <SafeAreaProvider>
      <Toasts key={colorScheme} />
      <View style={{ flex: 1, backgroundColor: backgroundColor }}>
        {isAppReady ? (
          <NavigationThemeProvider
            value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}
          >
            <Stack screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Protected guard={isAuthenticated}>
                  <Stack.Screen name="(protected)" />
                </Stack.Protected>
              ) : (
                <Stack.Protected guard={!isAuthenticated}>
                  <Stack.Screen name="(auth)" />
                </Stack.Protected>
              )}
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </NavigationThemeProvider>
        ) : null}
      </View>
    </SafeAreaProvider>
  );
}
