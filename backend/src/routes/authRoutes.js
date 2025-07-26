import express from "express";
import { login, signUp } from "../controllers/authController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema } from "../validation/userValidation.js";

const router = express.Router();

router.post("/login", login);
router.post("/signup", validate(createUserSchema), signUp);   
// router.get("/verify-email/:id/:token", );

export default router;