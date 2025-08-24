import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  storeTokens,
  getTokens,
  removeTokens,
  storeRememberMe,
  removeRememberMe,
  getRememberMe,
  getRefreshToken,
} from "@/utils/tokenManager";
import { SplashScreen, router } from "expo-router";
import { isExpired } from "@/utils/isExpired";
import { getUserIdFromToken } from "@/utils/getUserIdFromToken";
import { refreshApi } from "@/api/auth";
import {
  setTokensCallback,
  setAccessTokenGetter,
  setSignOutCallback,
} from "@/utils/api-client";
import { useGetUserQuery } from "@/hooks/user/useUserQuery";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [canFetchUser, setCanFetchUser] = useState(false);
  const { data: userData, isError } = useGetUserQuery(userId, canFetchUser);

  const isSigningOutRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const refreshTimeoutRef = useRef(null);

  const handleNewTokens = (newAccessToken) => {
    setAccessToken(newAccessToken);
    setUserId(getUserIdFromToken(newAccessToken));
    console.log(
      "Tokens updated from interceptor, new accessToken:",
      newAccessToken
    );
  };

  // prihlaseni
  const signIn = async (
    newAccessToken,
    newRefreshToken,
    userData,
    rememberMe = false
  ) => {
    try {
      await storeTokens(newAccessToken, newRefreshToken);
      await storeRememberMe(rememberMe);
      setUserId(getUserIdFromToken(newAccessToken));
      setUser(userData);
      setAccessToken(newAccessToken);
      // router.replace("/(tabs)");
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  // odhlaseni
  const signOut = useCallback(async () => {
    if (isSigningOutRef.current) {
      console.log("Sign out is already in progress, skipping.");
      return;
    }
    isSigningOutRef.current = true;
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      setCanFetchUser(false);
      await removeTokens();
      await removeRememberMe();
      setAccessToken(null);
      setUserId(null);
      setUser(null);
      await AsyncStorage.removeItem("selected_language");
      console.log("sign out...");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
      SplashScreen.hideAsync();
      isSigningOutRef.current = false;
    }
  }, []);

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  // callbacky kvuli api client
  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
    setSignOutCallback(signOut);
    setTokensCallback(handleNewTokens);
  }, [getAccessToken, signOut]);

  //------mozna pak odstranit------------------------------------------------------
  //nacte uzivatele na zacatku pokud byl predtim remmeber true
  useEffect(() => {
    if (userData?.data) {
      setUser(userData.data);
      console.log("User data saved to context.");
    }
  }, [userData]);

  useEffect(() => {
    if (isError) {
      console.error("Error fetching user data:", isError);
      // signOut();
    }
  }, [isError]);
  //.----------------------------------------------------------------------------------

  const refreshTokens = useCallback(async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        console.log("No tokens found, signing out.");
        signOut();
        return;
      }
      const { data } = await refreshApi({ refreshToken });
      await storeTokens(data.accessToken, data.refreshToken);
      setAccessToken(data.accessToken);
    } catch (refreshError) {
      console.error("Failed to refresh token:", refreshError);
      signOut();
    }
  }, [signOut]);

  //pokud tokenu ma min jak minutu do expirace tak ho obnovi
  useEffect(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (accessToken) {
      // pokud uz expiroval tak ho obnov
      if (isExpired(accessToken)) {
        console.log("Token expired, refreshing immediately.");
        refreshTokens();
      } else {
        //jinak nastavi casovac pro obnovi

        const decoded = jwtDecode(accessToken);
        const expiresIn = decoded.exp * 1000 - Date.now();
        const refreshBefore = expiresIn - 60000; //60 vterin pred expiraci

        if (refreshBefore > 0) {
          refreshTimeoutRef.current = setTimeout(() => {
            console.log("Proactively refreshing token...");
            refreshTokens();
          }, refreshBefore);
        } else {
          //pokud uz mel min jak minutu, okamzite obnovi
          console.log("Token close to expiry, refreshing immediately.");
          refreshTokens();
        }
      }
    }
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [accessToken, refreshTokens]);

  // nacte stav prihlaseni na startu aplikace
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const checkAuthentication = async () => {
        try {
          const rememberMe = await getRememberMe();
          const { accessToken, refreshToken } = await getTokens();
          if (!accessToken || !refreshToken || !rememberMe) {
            console.log("No session data found, signing out.");
            signOut();
            return;
          }
          setAccessToken(accessToken);
          setUserId(getUserIdFromToken(accessToken));
          setCanFetchUser(true);
        } catch (error) {
          console.error("Error during authentication check:", error);
          signOut();
        } finally {
          setIsLoading(false);
          SplashScreen.hideAsync();
        }
      };
      checkAuthentication();
    }
  }, [signOut]);

  const value = {
    user,
    userId,
    setUser,
    accessToken,
    canFetchUser,
    isLoading,
    isAuthenticated: !!accessToken,
    signIn,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
