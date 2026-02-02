import handleResponse from "../utils/responseHandler.js";
import {
  changePasswordService,
  forgotPasswordService,
  loginService,
  logoutService,
  refreshService,
  resendVerifyEmailService,
  resetPasswordService,
  signUpService,
  verifyEmailService,
} from "../services/authService.js";

export const signUp = async (req, res, next) => {
  try {
    const { username, email, password, preferredLanguage } = req.body;
    const clientType = req.headers["x-client-type"];

    const responseData = await signUpService({ username, email, password, preferredLanguage });

    if (clientType === "mobile") {
      // pro mobil tokeny v JSON těle
      return handleResponse(res, 201, "User created successfully", {
        responseData,
      });
    } else {
      // pro web se refresh token nastavi do HTTP-only cookie kvuli XSS utokum
      res.cookie("refreshToken", responseData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      return handleResponse(res, 201, "User created successfully", {
        accessToken: responseData.accessToken,
        user: responseData.user,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const clientType = req.headers["x-client-type"];

    const responseData = await loginService({ email, password });

    if (clientType === "mobile") {
      // pro mobil tokeny v JSON těle
      return handleResponse(res, 200, "Login successful", responseData);
    } else {
      // pro web se refresh token nastavi do HTTP-only cookie
      res.cookie("refreshToken", responseData.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      return handleResponse(res, 200, "Login successful", {
        accessToken: responseData.accessToken,
        user: responseData.user,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const clientType = req.headers["x-client-type"];
    const refreshToken = clientType === "mobile" ? req.body.refreshToken : req.cookies.refreshToken;
    const { newAccessToken, newRefreshToken } = await refreshService(refreshToken);

    if (clientType === "mobile") {
      // pro mobil tokeny v JSON těle
      return handleResponse(res, 200, "Tokens refreshed successfully", {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } else {
      // pro web se refresh token nastavi do HTTP-only cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
        maxAge: 15 * 24 * 60 * 60 * 1000,
      });
      return handleResponse(res, 200, "Tokens refreshed successfully", {
        accessToken: newAccessToken,
      });
    }
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const clientType = req.headers["x-client-type"];
    const refreshToken = clientType === "mobile" ? req.body.refreshToken : req.cookies.refreshToken;
    await logoutService(refreshToken);

    if (clientType !== "mobile") {
      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
      });
    }
    return handleResponse(res, 200, "Logout successful");
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    await verifyEmailService(token);

    return handleResponse(res, 200, "Email successfully verified! You can now log in.");
  } catch (err) {
    console.error("Error during email verification:", err);
    next(err);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    await forgotPasswordService(email);

    return handleResponse(res, 200, "Password reset link has been sent.");
  } catch (err) {
    console.error("Forgot password error:", err);
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.query;
    const { newPassword } = req.body;

    await resetPasswordService(token, newPassword);

    return handleResponse(res, 200, "Password has been reset successfully. You can now log in.");
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const email = req.user.email;

    await changePasswordService(email, oldPassword, newPassword);

    return handleResponse(res, 200, "Password has been successfully changed");
  } catch (err) {
    next(err);
  }
};

export const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    await resendVerifyEmailService(email);

    return handleResponse(res, 200, "Resend verify email succesfully.");
  } catch (err) {
    console.error("Resend email to verify email error:", err);
    next(err);
  }
};
