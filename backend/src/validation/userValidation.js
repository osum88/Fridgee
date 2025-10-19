import Joi from "joi";

const allowedLanguages = ["en", "cs"];
const allowedCountries = ["CZ", "SK", "OTHER"];
const allowedGenders = ["MALE", "FEMALE", "OTHER", "UNSPECIFIED"];

export const createUserSchema = Joi.object({
    name: Joi.string().max(40).optional(),
    surname: Joi.string().max(40).allow(null, "").optional(), 
    username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9]+$/).required(), 
    birthDate: Joi.date().iso().max("now").optional(),
    email: Joi.string().email().required(), 
    password: Joi.string().min(6).required(), 
    emailIsVerified: Joi.boolean().default(false), 
    verificationToken: Joi.string().allow(null).default(null).optional(),
    tokenExpiresAt: Joi.date().allow(null).default(null).optional(),
    passwordResetToken: Joi.string().allow(null).default(null).optional(),
    passwordResetExpiresAt: Joi.date().allow(null).default(null).optional(),
    bankNumber: Joi.string().min(1).max(50).optional(), 
    isAdmin: Joi.boolean().default(false), 
    preferredLanguage: Joi.string().valid(...allowedLanguages).default("en").optional(),
    
});

export const updateUserSchema = Joi.object({
    name: Joi.string().max(40).allow("").optional(),
    surname: Joi.string().max(40).allow(null, "").optional(),
    username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9]+$/).optional(), 
    birthDate: Joi.date().iso().max("now").allow("").optional(),
    email: Joi.string().email().optional(),
    bankNumber: Joi.string().max(50).allow("").optional(),
    isAdmin: Joi.boolean().optional(),
    preferredLanguage: Joi.string().valid(...allowedLanguages).optional(),
    gender: Joi.string().valid(...allowedGenders).default("UNSPECIFIED").optional(),
    country: Joi.string().valid(...allowedCountries).allow("").optional(),
});

export const updateUserAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    name: Joi.string().max(40).allow("").optional(),
    surname: Joi.string().max(40).allow(null, "").optional(),
    username: Joi.string().min(3).max(30).pattern(/^[a-zA-Z0-9]+$/).optional(), 
    birthDate: Joi.date().iso().max("now").allow("").optional(),
    email: Joi.string().email().optional(),
    bankNumber: Joi.string().max(50).allow("").optional(),
    isAdmin: Joi.boolean().optional(),
    preferredLanguage: Joi.string().valid(...allowedLanguages).optional(),
    gender: Joi.string().valid(...allowedGenders).default("UNSPECIFIED").optional(),
    country: Joi.string().valid(...allowedCountries).allow("").optional(),
});

export const updateLanguageSchema = Joi.object({
    preferredLanguage: Joi.string().valid(...allowedLanguages).required(),
});

export const getBankNumberPasswordSchema = Joi.object({
    password: Joi.string().min(6).required(), 
});

