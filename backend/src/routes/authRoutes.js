import express from "express";
import { login, refresh, signUp, logout, verifyEmail, resetPassword, forgotPassword, changePassword, resendVerifyEmail } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema, signUpSchema } from "../validation/authValidation.js";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();

router.post("/login", sanitize, validate(loginSchema), login);
router.post("/signup", sanitize, validate(signUpSchema), signUp);   
router.post("/refresh", refresh);
router.post("/logout", logout)
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", sanitize, validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verify-email", sanitize, validate(forgotPasswordSchema), resendVerifyEmail);
router.post("/reset-password", sanitize, validate(resetPasswordSchema), resetPassword);
router.post("/change-password", authenticateToken, authorizeUser, sanitize, validate(changePasswordSchema), changePassword);

export default router;