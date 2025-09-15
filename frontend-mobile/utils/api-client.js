import axios from "axios";
import { getRefreshToken, storeTokens } from "./tokenManager";

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

//instance axiosu
const apiClient = axios.create({
  // baseURL: "http://localhost:3001/api",

  baseURL: `http://10.0.0.2:3001/api`, //wifi doma
  // baseURL: `http://10.160.48.141:3001/api`,           //mobil hotspot
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pro pozadavky
apiClient.interceptors.request.use(
  (config) => {
    if (accessTokenGetter) {
      const accessToken = accessTokenGetter();
      if (accessToken) {
        console.log("Header Bearer token:", accessToken.substring(0, 30));
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // pokud je chyba 401 a pozadavek jeste nebyl opakovan
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // pokud probiha obnova tokenu tak se pozadavek zaradi do fronty
      if (isRefreshing) {
        return new Promise((resolve) => {
          failedRequests.push((token) => {
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

        const { data } = await apiClient.post(
          "/auth/refresh",
          { refreshToken },
          {
            headers: {
              "X-Client-Type": "mobile",
            },
          }
        );
        const accessToken = data.data.accessToken;
        await storeTokens(accessToken, data.data.refreshToken);

        //nastavim novy access token do kontextu
        if (setNewAccessTokenCallback) {
          setNewAccessTokenCallback(accessToken);
        }

        isRefreshing = false;
        failedRequests.forEach((callback) => callback(accessToken));
        failedRequests = [];

        apiClient.defaults.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        isRefreshing = false;
        failedRequests = [];
        if (signOutCallback) {
          signOutCallback();
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
