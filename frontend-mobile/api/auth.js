import apiClient from "@/utils/api-client";
import i18n from "@/constants/translations";
import { EmailError, PasswordError, } from "@/errors/CustomError";

export const loginApi = async (loginData) => {
  try {
    const response = await apiClient.post("/auth/login", loginData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in loginApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export const signupApi = async (signupData) => {
  try {
    const response = await apiClient.post("/auth/signup", signupData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in signupApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
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
    console.error(
      `Error in refreshApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export const logoutApi = async (logoutData) => {
  try {
    const response = await apiClient.post("/auth/logout", logoutData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error logoutApi: ", error);
    throw error;
  }
};

export const verifyEmailApi = async (verifyToken) => {
  try {
    console.log("token", verifyToken);
    const response = await apiClient.get(`/auth/verify-email?token=${verifyToken}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error in verifyEmailApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export const forgotPasswordApi = async (forgotPasswordData) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", forgotPasswordData);
    return response.data;
  } catch (error) {
    console.error(
      `Error in forgotPasswordApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export const resendVerifyEmailApi = async (resendVerifyEmailData) => {
  try {
    const response = await apiClient.post("/auth/resend-verify-email", resendVerifyEmailData);
    return response.data;
  } catch (error) {
    console.error(
      `Error in resendVerifyEmailApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );

    if (
      error.response.status === 409 &&
      error.response.data.message === "Email is already verified."
    ) {
      throw new EmailError(i18n.t("emailAlreadyVerified"));
    } else if (error.response.data?.errors?.includes('"email" must be a valid email')) {
      throw new EmailError(i18n.t("errorValidEmail"));
    }
    throw error;
  }
};

export const resetPasswordApi = async (token, resetPasswordData) => {
  try {
    const response = await apiClient.post(`/auth/reset-password?token=${token}`, resetPasswordData);
    return response.data;
  } catch (error) {
    console.error(
      `Error in forgotPasswordApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    if (error.response) {
      const { status, type, code } = error.response?.data || {};

      if (status === 400) {
        if (type === "newPassword" && (code === "STRING_PATTERN.BASE" || code === "STRING_MIN")) {
          throw new PasswordError(i18n.t("errorPasswordTooWeak"));
        } else if (
          type === "resetPassword" &&
          (code === "INVALID_TOKEN" || code === "TOKEN_EXPIRED")
        ) {
          throw new PasswordError(i18n.t("invalidOrExpiredResetToken"));
        }
      } else if (status === 429) {
        throw new PasswordError(i18n.t("errorTooManyRequest"));
      } else {
        throw new PasswordError(i18n.t("errorDefault"));
      }
    } else if (error.request) {
      throw new PasswordError(i18n.t("errorNetwork"));
    } else {
      throw new PasswordError(i18n.t("errorDefault"));
    }
  }
};

export const changePasswordApi = async (changePasswordData) => {
  const response = await apiClient.post("/auth/change-password", changePasswordData);
  return response.data;
};
