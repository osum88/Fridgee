import axios from "axios";

let accessTokenGetter = null;

export const setAccessTokenGetter = (getter) => {
  accessTokenGetter = getter;
};

//instance axiosu
const apiClient = axios.create({
  // baseURL: "http://localhost:3001/api",

  baseURL: `http://10.0.0.2:3001/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pro pozadavky
apiClient.interceptors.request.use(
  (config) => {
    if (accessTokenGetter) {
      const accessToken = accessTokenGetter();
      console.log("Header Bearer token: ", accessToken);
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//interceptor pro odpovedi
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // if (error.response?.status === 401) {
    //   console.log("Uživatel není autorizovaný. Přesměrování na login...");
    // router.replace("/login");
    // }
    return Promise.reject(error);
  }
);

export default apiClient;
