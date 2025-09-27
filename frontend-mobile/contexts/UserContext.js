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
import { SplashScreen } from "expo-router";
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
import useLogoutMutation from "@/hooks/auth/useLogoutMutation";
import { invalidateQueries } from "@/utils/invalidateQueries";
import { useQueryClient } from "@tanstack/react-query";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [canFetchUser, setCanFetchUser] = useState(false);
  const queryClient = useQueryClient();

  // const { data: userData, isError } = useGetUserQuery(userId, canFetchUser);

  const { logoutMutation } = useLogoutMutation();

  const isSigningOutRef = useRef(false);
  const isInitialLoadRef = useRef(true);
  const refreshTimeoutRef = useRef(null);
  const refreshingPromiseRef = useRef(null);

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
      setCanFetchUser(false);
      await storeTokens(newAccessToken, newRefreshToken);
      await storeRememberMe(rememberMe);
      setUserId(getUserIdFromToken(newAccessToken));
      setUser(userData);
      setAccessToken(newAccessToken);
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
      const refreshToken = await getRefreshToken();
      logoutMutation.mutate({ refreshToken });
      await removeTokens();
      await removeRememberMe();
      setAccessToken(null);
      setUserId(null);
      setUser(null);
      invalidateQueries(queryClient, ["searchUsername", "allFriends", "receivedFriendRequests",]);
      await AsyncStorage.removeItem("selected_language");
      console.log("sign out...");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
      SplashScreen.hideAsync();
      isSigningOutRef.current = false;
    }
  }, [logoutMutation, queryClient]);

  const getAccessToken = useCallback(() => accessToken, [accessToken]);

  // callbacky kvuli api client
  useEffect(() => {
    setAccessTokenGetter(getAccessToken);
    setSignOutCallback(signOut);
    setTokensCallback(handleNewTokens);
  }, [getAccessToken, signOut]);

  //refresh tokenu
  const refreshTokens = useCallback(async () => {
    if (refreshingPromiseRef.current) {
      return refreshingPromiseRef.current;
    }
    refreshingPromiseRef.current = (async () => {
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          console.log("No tokens found, signing out.");
          await signOut();
          return;
        }
        const { data } = await refreshApi({ refreshToken });
        await storeTokens(data.accessToken, data.refreshToken);
        setAccessToken(data.accessToken);
        return data.accessToken;
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        await signOut();
      } finally {
        refreshingPromiseRef.current = null;
      }
    })();

    return refreshingPromiseRef.current;
  }, [signOut]);

  //pokud tokenu ma min jak minutu do expirace tak ho obnovi
  useEffect(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    if (accessToken) {
      // pokud uz expiroval tak ho obnovi
      if (isExpired(accessToken)) {
        console.log("Token expired, refreshing immediately.");
        refreshTokens();
        //jinak nastavi casovac pro obnovi
      } else {
        const decoded = jwtDecode(accessToken);
        const expiresIn = decoded.exp * 1000 - Date.now();
        const refreshBefore = expiresIn - 60000; //60 vterin pred expiraci

        if (refreshBefore > 0) {
          refreshTimeoutRef.current = setTimeout(() => {
            console.log("Proactively refreshing token...");
            refreshTokens();
          }, refreshBefore);
          //pokud uz mel min jak minutu, okamzite obnovi
        } else {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
