import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";
import { getFriendshipRepository } from "../repositories/friendRepository.js";
import { createUserRepository, deleteUserRepository, getBankNumberRepository, getImageUrlRepository, getUserByEmailRepository, getUserByIdRepository, getUserByUsernameRepository, searchUsersRepository, updatePreferredLanguageByUserIdRepository, updateUserProfileImageRepository, updateUserRepository } from "../repositories/userRepository.js";
import sharp from "sharp";
import { generateImageFilename, resizeImage } from "../services/imageService.js"

export const createUserService = async (name, surname, username, birthDate, email, password, bankNumber, preferredLanguage) => {
    const existingUserByEmail = await getUserByEmailRepository(email);
    if (existingUserByEmail) {
        throw new ConflictError("A user with this email already exists.");
    }

    const existingUserByUsername = await getUserByUsernameRepository(username);
    if (existingUserByUsername) {
        throw new ConflictError("A user with this username already exists.");
    }

    const newUser = await createUserRepository(
        name,
        surname,
        username,
        birthDate,
        email,
        password,
        bankNumber,
        preferredLanguage
    );
    return newUser;
};

export const getUserByIdService = async (userId) => {
    const user = await getUserByIdRepository(userId);
    
    if (!user) {
        throw new NotFoundError("User not found.");
    }
    
    return user;
};

export const updateUserService = async (id, updateData) => {
    
    const userToUpdate = await getUserByIdRepository(id);

    if (updateData.email && updateData.email !== userToUpdate.email) {
        const existingUserByEmail = await getUserByEmailRepository(updateData.email);
        if (existingUserByEmail) {
            throw new ConflictError("A user with this email already exists.");
        }
    }

    if (updateData.username && updateData.username !== userToUpdate.username) {
        const existingUserByUsername = await getUserByUsernameRepository(updateData.username);
        if (existingUserByUsername) {
            throw new ConflictError("A user with this username already exists.");
        }
    }

    const updatedUser = await updateUserRepository(id, updateData);

    if (!updatedUser) {
        throw new NotFoundError("User not found after update.");
    }

    return updatedUser;
};

export const deleteUserService = async (id, admin) => {

    if (admin){
        const user = await getUserByIdRepository(id);
    }
    const deletedUser = await deleteUserRepository(id);
    if (!deletedUser) {
        throw new NotFoundError("User not found.");
    }
    
    return deletedUser;
};

export const getBankNumberService = async (id) => {

    const bankNumber = await getBankNumberRepository(id);
    
    if (bankNumber === null) {
        throw new NotFoundError("Bank number not found for given user.");
    }

    return bankNumber;
};

export const searchUsersService = async (userId, username, limit = 10) => {
    if (!username || username.trim() === "") {
        throw new BadRequestError("Username is required for search.");
    }
    
    const sanitizedUsername = username.trim().replace(/\s+/g, "").toLowerCase();
    
    const users = await searchUsersRepository(userId, sanitizedUsername, parseInt(limit, 10));

    // pokud nejsou nalezeni zadni uzivatele
    if (users.length === 0) {
        return users;
    }

    const friendshipPromises = users.map(user => 
        getFriendshipRepository(userId, user.id)
    );

    const friendships = await Promise.all(friendshipPromises);

    const usersWithFriendships = users.map((user, index) => ({
        ...user, 
        friendships: friendships[index], 
    }));

    return usersWithFriendships;
};

//updatuje jazky
export const updatePreferredLanguageByUserIdService = async (id, language) => {
    
    const updatedUser = await updatePreferredLanguageByUserIdRepository(id, language);

    if (!updatedUser) {
        throw new NotFoundError("User not found after update.");
    }
    return updatedUser;
};

export const updateUserProfileImageService = async (userId, image, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId); 
    }
    const imageUrl = await getImageUrlRepository(userId);
    if (!imageUrl) {

    }
 

    const profileImage400x400 = await resizeImage(image, 400, userId, "profile", "webp");
    const profileImage200x200 = await resizeImage(image, 200, userId, "profile", "webp");

   
}