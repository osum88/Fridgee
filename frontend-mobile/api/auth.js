import apiClient from "@/utils/api-client";
import i18n from "@/constants/translations";

export const loginApi = async (loginData) => {
  try {
    const response = await apiClient.post("/auth/login", loginData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error loginApi: ", error);
    if (error.response) {
        console.error("Error loginApi: ", error.response.data);
        
        if (error.response.status === 400 && error.response.data.message === "Wrong email or password") {
            throw new Error(i18n.t("error400Login"));
        } else if (error.response.data?.errors?.includes('"email" must be a valid email')) {
            throw new Error(i18n.t("errorValidEmail"));
        } else if (
            error.response.data?.errors?.includes('"email" is not allowed to be empty') ||
            error.response.data?.errors?.includes('"password" is not allowed to be empty')
        ) {
            throw new Error(i18n.t("errorEmptyEmailPassword"));
        } else {
            throw new Error(i18n.t("errorDefault"));
        }
    } else if (error.request) {
        throw new Error(i18n.t("errorNetwork"));
    } else {
        throw new Error(i18n.t("errorDefault"));
    }
  }
};

export const signupApi = async (signupData) => {
  const response = await apiClient.post("/auth/signup", signupData);
  return response.data;
};

export const refreshApi = async (refreshData) => {
    try {
    const response = await apiClient.post("/auth/refresh", refreshData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error refreshApi: ", error);
    throw error
  }
};

export const logoutApi = async (logoutData) => {
  const response = await apiClient.post("/auth/logout", logoutData);
  return response.data;
};

export const verifyEmailApi = async (verifyEmailData) => {
  const response = await apiClient.get("/auth/verify-email", verifyEmailData);
  return response.data;
};

export const forgotPasswordApi = async (forgotPasswordData) => {
  const response = await apiClient.post(
    "/auth/forgot-password",
    forgotPasswordData
  );
  return response.data;
};

export const resetPasswordApi = async (resetPasswordData) => {
  const response = await apiClient.post(
    "/auth/reset-password",
    resetPasswordData
  );
  return response.data;
};

export const changePasswordApi = async (changePasswordData) => {
  const response = await apiClient.post(
    "/auth/change-password",
    changePasswordData
  );
  return response.data;
};
