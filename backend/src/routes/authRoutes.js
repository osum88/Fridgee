import express from "express";
import { login, refresh, signUp, logout, verifyEmail } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { loginSchema, signUpSchema } from "../validation/authValidation.js";
import { authenticateToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/login", validate(loginSchema), login);
router.post("/signup", validate(signUpSchema), signUp);   
router.post("/refresh", refresh);
router.post("/logout", authenticateToken, logout)
router.get('/verify-email', verifyEmail);
// router.get("/verify-email/:token", );

export default router;