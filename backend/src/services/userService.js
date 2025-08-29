import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";
import { createUserRepository, deleteUserRepository, getBankNumberRepository, getUserByEmailRepository, getUserByIdRepository, getUserByUsernameRepository, searchUsersRepository, updatePreferredLanguageByUserIdRepository, updateUserRepository } from "../repositories/userRepository.js";

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
    
    const sanitizedUsername = username.trim().replace(/\s+/g, "");
    
    const users = await searchUsersRepository(userId, sanitizedUsername, parseInt(limit, 10));

    return users;
};

//updatuje jazky
export const updatePreferredLanguageByUserIdService = async (id, language) => {
    
    const updatedUser = await updatePreferredLanguageByUserIdRepository(id, language);

    if (!updatedUser) {
        throw new NotFoundError("User not found after update.");
    }
    return updatedUser;
};
