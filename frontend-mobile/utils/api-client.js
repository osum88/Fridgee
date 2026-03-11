import axios , { isCancel } from "axios";
import { getRefreshToken, storeTokens } from "./tokenManager";
import { API_BASE_URL } from "@/config/config";
import { showGlobalError } from "@/utils/showGlobalError";

let accessTokenGetter = null;
let signOutCallback = null;
let isRefreshing = false;
let failedRequests = [];
let setNewAccessTokenCallback = null;

export const setAccessTokenGetter = (getter) => {
  accessTokenGetter = getter;
};

export const setSignOutCallback = (callback) => {
  signOutCallback = callback;
};

export const setTokensCallback = (callback) => {
  setNewAccessTokenCallback = callback;
};

// globalni error
const isGlobalError = (error) => {
  if (isCancel(error)) return false;
  if (!error.response) return true;
  const { status } = error.response;
  return status === 500 || status === 429;
};

//instance axiosu
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pro pozadavky
apiClient.interceptors.request.use(
  (config) => {
    if (config.headers.Authorization && config._retry) {
      console.log(
        "Header Bearer token config:",
        config.headers.Authorization.replace("Bearer ", "").substring(0, 10),
      );
      return config;
    }

    if (accessTokenGetter) {
      const accessToken = accessTokenGetter();
      if (accessToken) {
        console.log("Header Bearer token:", accessToken.substring(0, 10));
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (isGlobalError(error)) {
      showGlobalError(error);
    }

    // pokud je chyba 401 a pozadavek jeste nebyl opakovan
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // pokud probiha obnova tokenu tak se pozadavek zaradi do fronty
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedRequests.push((token) => {
            if (!token) return reject(error);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          { headers: { "X-Client-Type": "mobile" } },
        );
        const accessToken = data?.data?.accessToken;
        await storeTokens(accessToken, data?.data?.refreshToken);

        //nastavim novy access token do kontextu
        if (setNewAccessTokenCallback) {
          setNewAccessTokenCallback(accessToken);
        }

        isRefreshing = false;
        failedRequests.forEach((callback) => callback(accessToken));
        failedRequests = [];

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;

        // sitova chyba -> neodhlasovat, jen odmit request
        if (!refreshError?.response) {
          failedRequests.forEach((callback) => callback(null));
          failedRequests = [];
          return Promise.reject(refreshError);
        }

        showGlobalError({ response: { status: 401, _isAuthExpired: true } });

        // auth chyba (401/403) -> odhlasit
        console.error("Failed to refresh token:", refreshError);
        failedRequests = [];
        if (signOutCallback) {
          signOutCallback();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
