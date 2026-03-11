import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Network from "expo-network";
import { router, SplashScreen, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { LanguageProvider, useLanguage } from "@/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useEffect, useState } from "react";
import { QueryClient, focusManager, onlineManager } from "@tanstack/react-query";
import { UserProvider } from "@/contexts/UserContext";
import { useUser } from "@/hooks/useUser";
import { View, AppState, Platform } from "react-native";
import { Provider } from "react-native-paper";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useSystemNavigationBarTheme } from "@/hooks/colors/useSystemNavigationBarTheme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { SnackbarProvider, useSnackbar } from "@/contexts/SnackbarContext";
import { setSnackbarCallback } from "@/utils/showGlobalError";

const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_SEC = 1000;
const TWO_SEC = 1000 * 2;
const THIRTY_SEC = 1000 * 30;

//vytvoreni instance TanStack Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attempt) => Math.min(TWO_SEC ** attempt, THIRTY_SEC),
      gcTime: ONE_DAY,
    },
  },
});

// propojeni TanStack Query s diskem telefonu
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: "FOOD_SYSTEM_OFFLINE_CACHE",
  throttleTime: ONE_SEC, // uklada na disk max jednou za sekundu
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceMono: require("@/assets/fonts/SpaceMono-Regular.ttf"),
    Pattaya: require("@/assets/fonts/subset-Pattaya-Regular.ttf"),
    MaterialCommunityIcons: require("@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.ttf"),
  });

  const CustomDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      card: "#1f1f1f",
      background: "#121212",
    },
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister: asyncStoragePersister,
        maxAge: ONE_DAY,
      }}
      onSuccess={() => {
        // queryClient.resumePausedMutations();  //jakmile se data z disku nactou do pameti, odesleme mutace, ktere selhyly v offline
        //TODO rozhodnou se jestli pouzit
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <UserProvider>
          <LanguageWrapper>
            <ThemeProvider>
              <SnackbarProvider>
                <Provider>
                  <RootLayoutContent CustomDarkTheme={CustomDarkTheme} />
                </Provider>
              </SnackbarProvider>
            </ThemeProvider>
          </LanguageWrapper>
        </UserProvider>
      </GestureHandlerRootView>
    </PersistQueryClientProvider>
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
  useSystemNavigationBarTheme();
  const { showSnackbar } = useSnackbar();

  useEffect(() => {
    setSnackbarCallback(showSnackbar);
  }, [showSnackbar]);

  //pokud se aplikace minimalizuje pak to oznami quary
  useEffect(() => {
    const subscription = AppState.addEventListener("change", (status) => {
      if (Platform.OS !== "web") {
        focusManager.setFocused(status === "active");
      }
    });
    return () => subscription.remove();
  }, []);

  // pokud se aplikace pripoji k wifi oznami to quary
  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      const checkNetwork = async () => {
        const state = await Network.getNetworkStateAsync();
        setOnline(!!state.isConnected);
      };
      checkNetwork();

      const subscription = Network.addNetworkStateListener((state) => {
        setOnline(!!state.isConnected);
      });
      return () => subscription.remove();
    });
  }, []);

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

  const backgroundColor = colorScheme === "dark" ? "#121212" : "#ffffff";

  return (
    <SafeAreaProvider>
      <Toasts key={colorScheme} />
      <View style={{ flex: 1, backgroundColor: backgroundColor }}>
        {isAppReady ? (
          <NavigationThemeProvider value={colorScheme === "dark" ? CustomDarkTheme : DefaultTheme}>
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
