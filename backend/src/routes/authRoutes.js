import express from "express";
import { login, refresh, signUp, logout, verifyEmail, resetPassword, forgotPassword } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signUpSchema } from "../validation/authValidation.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/signup", validate(signUpSchema), signUp);   
router.post("/refresh", refresh);
router.post("/logout", authenticateToken, logout)
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

export default router;