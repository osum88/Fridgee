import apiClient from "@/utils/api-client";
import i18n from "@/constants/translations";
import { EmailError, PasswordError, UsernameError } from "@/errors/CustomError";

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

      if (
        error.response.status === 400 &&
        error.response.data.message === "Wrong email or password"
      ) {
        throw new Error(i18n.t("error400Login"));
      } else if (
        error.response.data?.errors?.includes('"email" must be a valid email')
      ) {
        throw new Error(i18n.t("errorValidEmail"));
      } else if (
        error.response.data?.errors?.includes(
          '"email" is not allowed to be empty'
        ) ||
        error.response.data?.errors?.includes(
          '"password" is not allowed to be empty'
        )
      ) {
        throw new Error(i18n.t("errorEmptyEmailPassword"));
      } else if (
        error.response.data.includes("Too many requests from this IP address")
      ) {
        throw new Error(i18n.t("errorTooManyRequest"));
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
  try {
    const response = await apiClient.post("/auth/signup", signupData, {
      headers: {
        "X-Client-Type": "mobile",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error signupApi: ", error);
    if (error.response) {
      console.error("Error signupApi: ", error.response.data);
      const errors = error.response?.data?.errors || [];
      const data = error.response.data;

      if (
        error.response.status === 409 &&
        error.response.data.message === "A user with this email already exists."
      ) {
        throw new EmailError(i18n.t("errorUserEmailExists"));
      } else if (
        error.response.status === 409 &&
        error.response.data.message ===
          "A user with this username already exists."
      ) {
        throw new UsernameError(i18n.t("errorUserUsernameExists"));
      } else if (
        error.response.data?.errors?.includes('"email" must be a valid email')
      ) {
        throw new EmailError(i18n.t("errorValidEmail"));
      } else if (
        errors.some((e) => e.includes("fails to match the required pattern"))
      ) {
        throw new PasswordError(i18n.t("errorPasswordTooWeak"));
      } else if (
        errors.some((e) =>
          e.includes("length must be at least 8 characters long")
        )
      ) {
        throw new PasswordError(i18n.t("errorPasswordTooWeak"));
      } else if (
        errors.some((e) =>
          e.includes("length must be less than or equal to 30 characters long")
        )
      ) {
        throw new UsernameError(i18n.t("errorUsernameTooLong"));
      } else if (
        errors.some((e) =>
          e.includes("length must be at least 3 characters long")
        )
      ) {
        throw new UsernameError(i18n.t("errorUsernameTooLong"));
      } else if (
        typeof data === "string" &&
        data.includes("Too many requests from this IP address")
      ) {
        throw new Error(i18n.t("errorTooManyRequest"));
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
    console.log("token", verifyToken)
    const response = await apiClient.get(`/auth/verify-email?token=${verifyToken}`);
    return response.data;
  } catch (error) {
    console.error("Error verifyEmailApi: ", error);
    throw error;
  }
};

export const forgotPasswordApi = async (forgotPasswordData) => {
  try {
    const response = await apiClient.post(
      "/auth/forgot-password",
      forgotPasswordData
    );
    return response.data;
  } catch (error) {
    console.error("Error forgotPasswordApi: ", error);
    throw error;
  }
};

export const resendVerifyEmailApi = async (resendVerifyEmailData) => {
  try {
    const response = await apiClient.post("/auth/resend-verify-email", resendVerifyEmailData);
    return response.data;
  } catch (error) {
    console.error("Error resendVerifyEmailApi: ", error);
   
    if (
      error.response.status === 409 &&
      error.response.data.message === "Email is already verified."
    ) {
      throw new EmailError(i18n.t("emailAlreadyVerified"));
    } else if (
      error.response.data?.errors?.includes('"email" must be a valid email')
    ) {
      throw new EmailError(i18n.t("errorValidEmail"));
    } 
    throw error;
  }
};

export const resetPasswordApi = async (token, resetPasswordData) => {
  try {
    console.log(token, resetPasswordData);
    const response = await apiClient.post(
      `/auth/reset-password?token=${token}`,
      resetPasswordData
    );
    return response.data;
  } catch (error) {
    console.error("Error forgotPasswordApi: ", error);
    if (error.response) {
      console.error("Error forgotPasswordApi: ", error.response.data);
      const errors = error.response?.data?.errors || [];
      const data = error.response.data;

      if (
        error.response.status === 404 &&
        error.response.data.message ===
          "Password has been reset successfully. You can now log in."
      ) {
        throw error;
      } else if (
        errors.some((e) => e.includes("fails to match the required pattern")) ||
        errors.some((e) =>
          e.includes("length must be at least 8 characters long")
        )
      ) {
        throw new PasswordError(i18n.t("errorPasswordTooWeak"));
      } else if (
        typeof data === "string" &&
        data.includes("Too many requests from this IP address")
      ) {
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
  const response = await apiClient.post(
    "/auth/change-password",
    changePasswordData
  );
  return response.data;
};
