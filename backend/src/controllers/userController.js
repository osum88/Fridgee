import errorHandling from "../middlewares/errorHandler.js";
import { createUserRepository, deleteUserRepository, getAllUsersRepository, getBankNumberRepository, getUserByIdRepository, updateUserRepository, getUserByEmailRepository, getUserByUsernameRepository, searchUsersRepository, updateUserProfilePictureRepository } from "../repositories/userRepository.js";
import { createUserService, getUserByIdService, updateUserService } from "../services/userService.js";
import handleResponse from "../utils/responseHandler.js"

export const createUser = async (req, res, next) => {
    try {
        const { name, surname, username, birthDate, email, password, bankNumber} = req.body;

        const newUser = await createUserService(name, surname, username, birthDate, email, password, bankNumber);

        return handleResponse(res, 201, "User created successfully", newUser);
    } catch (err) {
        next(err);
    }
};

export const getAllUsersAdmin = async (req, res, next) => {
    try {
        const users = await getAllUsersRepository();
        handleResponse(res, 200, "Users fetched successfully", users);
    }
    catch(err){
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        
        const user = await getUserByIdService(userId);
        
        return handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
        next(err);
    }
};

export const getUserByIdAdmin = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        
        if (isNaN(id)) {
            throw new BadRequestError("Invalid user ID provided.");
        }
        const user = await getUserByIdService(id);
        
        return handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const id = req.user.id; 
        const updateData = req.body;

        const updatedUser = await updateUserService(id, updateData);

        return handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};

export const updateUserAdmin = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            throw new BadRequestError("Invalid user ID provided.");
        } 
        const updateData = req.body;

        const updatedUser = await updateUserService(id, updateData);

        return handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return handleResponse(res, 400, "Invalid user ID provided");
        }
        const deletedUser = await deleteUserRepository(id);
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
        const bankNumber = await getBankNumberRepository(id);
        if (bankNumber === null) {
            return handleResponse(res, 404, "Bank number not found for given user");
        }
        handleResponse(res, 200, "Bank number fetched successfully", bankNumber);
    }
    catch(err){
        next(err);
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { username, limit = 10 } = req.query;

        if (!username || username.trim() === "") {
            return handleResponse(res, 400, "Username is required for search");
        }
        const sanitizedUsername = username.trim().replace(/\s+/g, "");
        const users = await searchUsersRepository(sanitizedUsername, limit);

        handleResponse(res, 200, "Search users successfully", users);
    }
    catch(err){
        next(err);
    }
};


//dodelat servisu potom
export const updateUserProfilePicture = async (req, res, next) => {
    try {
        if (!req.file) {
            return handleResponse(res, 400, "No file uploaded.");
        }
        // const imageUrl = req.body.imageUrl;
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin){
            userId = req.body.userId;

            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }

            const user = await getUserByIdRepository(userId);
            if (!user) {
                return handleResponse(res, 404, "User not found.");
            }
        }
        else{
            userId = req.user.id;
        }
        const file = req.file;

        const imageUrl = await uploadToStorageRepository(file);     //TODO nahrani na cloud

        const updatedUser = await updateUserProfilePictureRepository(userId, imageUrl);

        return handleResponse(res, 200, "Profile picture updated successfully.", updatedUser);
    } catch (err) {
        next(err);
    }
};