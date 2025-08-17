import axios from "axios";

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

    return Promise.reject(error);
  }
);

export default apiClient;
