import { createContext, useCallback, useEffect, useRef, useState } from "react";
import {
  storeTokens,
  getTokens,
  removeTokens,
  storeRememberMe,
  removeRememberMe,
  getRememberMe,
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

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const isSigningOutRef = useRef(false);
  const isInitialLoadRef = useRef(true);

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
    rememberMe
  ) => {
    try {
      await storeTokens(newAccessToken, newRefreshToken);
      await storeRememberMe(rememberMe);
      setUserId(getUserIdFromToken(newAccessToken));
      setAccessToken(newAccessToken);
      setUser(userData);
      router.replace("/(tabs)");
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
      await removeTokens();
      await removeRememberMe();
      setAccessToken(null);
      setUserId(null);
      setUser(null);
      console.log("sign out...")
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

  // nacte stav prihlaseni na startu aplikace
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      const checkAuthentication = async () => {
        try {
          const rememberMe = await getRememberMe();
          if (!rememberMe) {
            console.log("Remember me is false, signing out.");
            signOut();
            return;
          }

          const { accessToken, refreshToken } = await getTokens();
          if (!accessToken || !refreshToken) {
            console.log("No tokens found, signing out.");
            signOut();
            return;
          }

          if (isExpired(accessToken)) {
            console.log("Access token expired, attempting to refresh.");
            try {
              const { data } = await refreshApi({ refreshToken });
              await storeTokens(data.accessToken, data.refreshToken);
              setAccessToken(data.accessToken);
              setUserId(getUserIdFromToken(data.accessToken));
            } catch (refreshError) {
              console.error("Failed to refresh token:", refreshError);
              signOut();
            }
          } else {
            console.log("Access token is valid");
            setAccessToken(accessToken);
            setUserId(getUserIdFromToken(accessToken));
          }
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
    isLoading,
    isAuthenticated: !!accessToken,
    signIn,
    signOut,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
