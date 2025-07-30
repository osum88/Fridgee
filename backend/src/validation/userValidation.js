import Joi from "joi";

export const createUserSchema = Joi.object({
    name: Joi.string().max(40).optional(),
    surname: Joi.string().max(40).allow(null, "").optional(), 
    username: Joi.string().min(3).max(30).required(), 
    birthDate: Joi.date().iso().max("now").optional(),
    email: Joi.string().email().required(), 
    password: Joi.string().min(6).required(), 
    emailIsVerified: Joi.boolean().default(false), 
    verificationToken: Joi.string().allow(null).default(null).optional(),
    tokenExpiresAt: Joi.date().allow(null).default(null).optional(),
    passwordResetToken: Joi.string().allow(null).default(null).optional(),
    passwordResetExpiresAt: Joi.date().allow(null).default(null).optional(),
    bankNumber: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9]+$/).optional(), 
    isAdmin: Joi.boolean().default(false), 
});

export const updateUserSchema = Joi.object({
    name: Joi.string().max(40).optional(),
    surname: Joi.string().max(40).allow(null, "").optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    birthDate: Joi.date().iso().max("now").optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().min(6).optional(),
    emailIsVerified: Joi.boolean().optional(),
    verificationToken: Joi.string().allow(null).default(null).optional(),
    tokenExpiresAt: Joi.date().allow(null).default(null).optional(),
    passwordResetToken: Joi.string().allow(null).default(null).optional(),
    passwordResetExpiresAt: Joi.date().allow(null).default(null).optional(),
    bankNumber: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9]+$/).optional(),
    isAdmin: Joi.boolean().optional(),
});