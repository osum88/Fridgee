import errorHandling from "../middlewares/errorHandler.js";
import { createUserService, deleteUserService, getAllUsersService, getBankNumberService, getUserByIdService, updateUserService, getUserByEmailService, getUserByUsernameService } from "../models/userModel.js";
import handleResponse from "../utils/responseHandler.js"

export const createUser = async (req, res, next) => {
    try {
        const { 
            name, 
            surname, 
            username, 
            birthDate, 
            email, 
            password, 
            bankNumber
        } = req.body;
        const existingUserByEmail = await getUserByEmailService(email);
        if (existingUserByEmail) {
            return handleResponse(res, 409, "A user with this email already exists"); 
        }

        const existingUserByUsername = await getUserByUsernameService(username);
        if (existingUserByUsername) {
            return handleResponse(res, 409, "A user with this username already exists"); 
        }

        const newUser = await createUserService(name, surname, username, birthDate, email, password,bankNumber);
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
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided.");
        }
        const { 
            name, 
            surname, 
            username, 
            birthDate, 
            email, 
            password, 
            bankNumber, 
            preferredLanguage 
        } = req.body;
        if (email){
            const existingUserByEmail = await getUserByEmailService(email);
            if (existingUserByEmail) {
                return handleResponse(res, 409, "A user with this email already exists"); 
            }
        }
        if (username){
            const existingUserByUsername = await getUserByUsernameService(username);
            if (existingUserByUsername) {
                return handleResponse(res, 409, "A user with this username already exists"); 
            }
        }
        const updatedUser = await updateUserService(id, name, surname, username, birthDate, email, password, bankNumber, preferredLanguage);

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
            return handleResponse(res, 400, "Invalid user ID provided");
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

export const getBankNumber = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided");
        }
        const bankNumber = await getBankNumberService(id);
        if (bankNumber === null) {
            return handleResponse(res, 404, "Bank number not found for given user");
        }
        handleResponse(res, 200, "Bank number fetched successfully", bankNumber);
    }
    catch(err){
        next(err);
    }
};