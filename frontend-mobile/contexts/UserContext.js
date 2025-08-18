import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  storeTokens,
  getTokens,
  removeTokens,
  storeRememberMe,
  removeRememberMe,
  getRememberMe,
} from "@/utils/tokenManager";
import { router, SplashScreen } from "expo-router";
import { isExpired } from "@/utils/isExpired";
import { refreshApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  //prihlaseni
  const signIn = async (
    newAccessToken,
    newRefreshToken,
    userData,
    rememberMe
  ) => {
    try {
      await storeTokens(newAccessToken, newRefreshToken);
      await storeRememberMe(rememberMe);
      setAccessToken(newAccessToken);
      setUser(userData);

      // router.replace('/(tabs)/index');
    } catch (error) {
      console.error("Error sign in:", error);
    }
  };

  // odhlaseni
  const signOut = async () => {
    try {
      await removeTokens();
      await removeRememberMe();
      setAccessToken(null);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoading(false);
      SplashScreen.hideAsync();
    }
  };

  const getAccessToken = () => accessToken;

  // nacte stav prihlaseni na startu aplikace
  useEffect(() => {
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
          } catch (refreshError) {
            console.error("Failed to refresh token:", refreshError);
            signOut();
          }
        } else {
          console.log("Access token is valid");
          setAccessToken(accessToken);
       
        }
      } catch (error) {
        console.error("Error during authentication check:", error);
      } finally {
        setIsLoading(false);
        SplashScreen.hideAsync();
      }
    };

    checkAuthentication();
  }, []);
  const value = {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!accessToken,
    signIn,
    signOut,
    getAccessToken,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
