import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const REMEMBER_ME_KEY = "rememberMe";

// ulozeni tokenu
export const storeTokens = async (accessToken, refreshToken) => {
  try {
    if (accessToken)
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
    if (refreshToken)
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    console.log("Tokens stored successfully");
  } catch (error) {
    console.error("Error storing tokens", error);
    throw new Error("Failed to securely store tokens.");
  }
};

// nacteni tokenu
export const getTokens = async () => {
  try {
    const accessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return { accessToken: null, refreshToken: null };
  }
};

// nacteni tokenu
export const getRefreshToken = async () => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    return refreshToken;
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return null;
  }
};

// odstraneni tokenu
export const removeTokens = async () => {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    console.log("Tokens removed successfully");
  } catch (error) {
    console.error("Error removing tokens:", error);
  }
};

// ulozeni rememberMe
export const storeRememberMe = async (rememberMe) => {
  try {
    await AsyncStorage.setItem(REMEMBER_ME_KEY, JSON.stringify(rememberMe));
    console.log("RememberMe stored successfully");
  } catch (error) {
    console.error("Error storing rememberMe:", error);
    throw new Error("Failed to store rememberMe.");
  }
};

// nacteni rememberMe
export const getRememberMe = async () => {
  try {
    const value = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    return value !== null ? JSON.parse(value) : null;
  } catch (error) {
    console.error("Error fetching rememberMe:", error);
    return null;
  }
};

// odstraneni rememberMe
export const removeRememberMe = async () => {
  try {
    await AsyncStorage.removeItem(REMEMBER_ME_KEY);
    console.log("RememberMe removed successfully");
  } catch (error) {
    console.error("Error removing rememberMe:", error);
  }
};
