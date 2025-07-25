import Joi from 'joi';

export const createUserSchema = Joi.object({
    name: Joi.string().max(40).optional(),
    surname: Joi.string().max(40).allow(null, '').optional(), 
    username: Joi.string().alphanum().min(3).max(30).required(), 
    age: Joi.number().integer().min(0).max(140).optional(),
    email: Joi.string().email().required(), 
    passwordHash: Joi.string().min(6).required(), 
    emailIsVerified: Joi.boolean().default(false), 
    bankNumber: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9]+$/).optional(), 
    isAdmin: Joi.boolean().default(false), 
});

export const updateUserSchema = Joi.object({
    name: Joi.string().max(40).optional(),
    surname: Joi.string().max(40).allow(null, '').optional(),
    username: Joi.string().alphanum().min(3).max(30).optional(),
    age: Joi.number().integer().min(0).max(120).optional(),
    email: Joi.string().email().optional(),
    passwordHash: Joi.string().min(6).optional(),
    emailIsVerified: Joi.boolean().optional(),
    bankNumber: Joi.string().min(1).max(50).pattern(/^[a-zA-Z0-9]+$/).optional(),
    isAdmin: Joi.boolean().optional(),
});