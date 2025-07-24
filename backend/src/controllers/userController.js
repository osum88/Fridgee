import errorHandling from "../middlewares/errorHandler.js";
import { createUserService, deleteUserService, getAllUsersService, getUserByIdService, updateUserService } from "../models/userModel.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export const createUser = async (req, res, next) => {
    const { name, age, email } = req.body;
    try {
        const newUser = await createUserService(name, parseInt(age), email);
        handleResponse(res, 201, "User created successfully", newUser);
    }
    catch(err){
        next(err);
    }
};

export const getAllUsers = async (req, res, next) => {
    try {
        const users = await getAllUsersService();
        handleResponse(res, 200, "Users fetched successfully", users);
    }
    catch(err){
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided.");
        }
        const user = await getUserByIdService(id);
        if(!user) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User fetched successfully", user);
    }
    catch(err){
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    const { name, age, email } = req.body;
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided.");
        }
        const updatedUser = await updateUserService(id, name, parseInt(age), email);
        if(!updatedUser) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User updated successfully", updatedUser);
    }
    catch(err){
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided.");
        }
        const deletedUser = await deleteUserService(id);
        if(!deletedUser) {
            return handleResponse(res, 404, "User not found");
        }
        handleResponse(res, 200, "User deleted successfully", deletedUser);
    }
    catch(err){
        next(err);
    }
};