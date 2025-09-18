import {
  getAllUsersRepository,
  getUserByIdRepository,
  updateUserProfileImageRepository,
} from "../repositories/userRepository.js";
import {
  createUserService,
  deleteUserProfileImageService,
  deleteUserService,
  getBankNumberService,
  getUserByIdService,
  searchUsersService,
  updatePreferredLanguageByUserIdService,
  updateUserProfileImageService,
  updateUserService,
} from "../services/userService.js";
import handleResponse from "../utils/responseHandler.js";

export const createUser = async (req, res, next) => {
  try {
    const {
      name,
      surname,
      username,
      birthDate,
      email,
      password,
      bankNumber,
      preferredLanguage,
    } = req.body;

    const newUser = await createUserService(
      name,
      surname,
      username,
      birthDate,
      email,
      password,
      bankNumber,
      preferredLanguage
    );

    return handleResponse(res, 201, "User created successfully", newUser);
  } catch (err) {
    next(err);
  }
};

export const getAllUsersAdmin = async (req, res, next) => {
  try {
    const users = await getAllUsersRepository();
    handleResponse(res, 200, "Users fetched successfully", users);
  } catch (err) {
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

    return handleResponse(
      res,
      200,
      "Bank number fetched successfully",
      bankNumber
    );
  } catch (err) {
    next(err);
  }
};

export const searchUsers = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { username, limit = 10 } = req.query;

    const users = await searchUsersService(userId, username, limit);

    return handleResponse(res, 200, "Search users successfully", users);
  } catch (err) {
    next(err);
  }
};

//updatuje user profile image
export const updateUserProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return handleResponse(res, 400, "No file uploaded.");
    }
    const userId = req.userId;
    const isAdmin = req.adminRoute;
    const image = req.file;

    const updatedUser = await updateUserProfileImageService(userId, image, isAdmin);

    return handleResponse(res, 200, "Profile picture updated successfully.", updatedUser);
  } catch (err) {
    next(err);
  }
};

//updatuje user profile image
export const deleteUserProfileImage = async (req, res, next) => {
  try {
  
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const deletedUserImage = await deleteUserProfileImageService(userId, isAdmin);

    return handleResponse(res, 200, "Profile picture delete successfully.", deletedUserImage);
  } catch (err) {
    next(err);
  }
};

export const updatePreferredLanguageByUserId = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { preferredLanguage } = req.body;

    const updatedUser = await updatePreferredLanguageByUserIdService(
      userId,
      preferredLanguage
    );

    return handleResponse(res, 200, "User updated successfully", updatedUser);
  } catch (err) {
    next(err);
  }
};
