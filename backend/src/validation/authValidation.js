import Joi from "joi";

export const signUpSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(), 
    email: Joi.string().email().required(), 
    password: Joi.string().min(6).required()
});

export const loginSchema = Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
});

export const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required(), 
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(), 
});

export const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().min(6).required(), 
    newPassword: Joi.string().min(6).required(), 
});
