import Joi from "joi";

const allowedLanguages = ["en", "cs"];

export const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(), 
    email: Joi.string().email().required(), 
    password: Joi.string().min(8).max(100).pattern(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/).required(),
    preferredLanguage: Joi.string().valid(...allowedLanguages).default("en").optional(),
});

export const loginSchema = Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
});

export const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(8).required(), 
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(), 
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(8).max(100).required(), 
    newPassword: Joi.string().min(8).max(100).required(), 
});
