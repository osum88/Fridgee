import express from "express";
import { login, refresh, signUp, logout, verifyEmail, resetPassword, forgotPassword, changePassword, resendVerifyEmail } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema, signUpSchema } from "../validation/authValidation.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();

router.post("/login", validate(loginSchema), sanitize, login);
router.post("/signup", validate(signUpSchema), sanitize, signUp);   
router.post("/refresh", refresh);
router.post("/logout", logout)
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), sanitize, forgotPassword);
router.post("/resend-verify-email", validate(forgotPasswordSchema), sanitize, resendVerifyEmail);
router.post("/reset-password", validate(resetPasswordSchema), sanitize, resetPassword);
router.post("/change-password", validate(changePasswordSchema), sanitize, authenticateToken, changePassword);

export default router;