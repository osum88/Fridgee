import { getAllUsersRepository, getUserByIdRepository, updateUserProfilePictureRepository } from "../repositories/userRepository.js";
import { createUserService, deleteUserService, getBankNumberService, getUserByIdService, searchUsersService, updatePreferredLanguageByUserIdService, updateUserService } from "../services/userService.js";
import handleResponse from "../utils/responseHandler.js"

export const createUser = async (req, res, next) => {
    try {
        const { name, surname, username, birthDate, email, password, bankNumber} = req.body;

        const newUser = await createUserService(name, surname, username, birthDate, email, password, bankNumber, preferredLanguage);

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
        const userId = req.userId;
       
        const user = await getUserByIdService(userId);
        
        return handleResponse(res, 200, "User fetched successfully", user);
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        const updateData = req.body;

        const updatedUser = await updateUserService(userId, updateData);

        return handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.userId;
        
        const deletedUser = await deleteUserService(userId, req.adminRoute);

        return handleResponse(res, 200, "User deleted successfully", deletedUser);
    } catch (err) {
        next(err);
    }
};

export const getBankNumber = async (req, res, next) => {
    try {
        const userId = req.userId;
        const bankNumber = await getBankNumberService(userId);
        
        return handleResponse(res, 200, "Bank number fetched successfully", bankNumber);
    } catch (err) {
        next(err);
    }
};

export const searchUsers = async (req, res, next) => {
    try {
        const { username, limit = 10 } = req.query;
        
        const users = await searchUsersService(username, limit);

        return handleResponse(res, 200, "Search users successfully", users);
    } catch (err) {
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

export const updatePreferredLanguageByUserId = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { preferredLanguage } = req.body;

        const updatedUser = await updatePreferredLanguageByUserIdService(userId, preferredLanguage);

        return handleResponse(res, 200, "User updated successfully", updatedUser);
    } catch (err) {
        next(err);
    }
};