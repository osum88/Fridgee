import express from "express";
import { login, refresh, signUp, logout, verifyEmail, resetPassword, forgotPassword, changePassword, resendVerifyEmail } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema, signUpSchema } from "../validation/authValidation.js";
import { authenticateToken, authorizeUserOrAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/signup", validate(signUpSchema), signUp);   
router.post("/refresh", refresh);
router.post("/logout", logout)
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/resend-verify-email", validate(forgotPasswordSchema), resendVerifyEmail);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);
router.post("/change-password", validate(changePasswordSchema), authenticateToken, changePassword);

export default router;