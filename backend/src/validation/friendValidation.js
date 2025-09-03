import Joi from "joi";

export const getFriendsSchema = Joi.object({
    username: Joi.string().allow("").optional(),
});

export const getFriendsAdminSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
    username: Joi.string().allow("").optional(),
});
