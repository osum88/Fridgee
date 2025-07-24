import prisma from '../utils/prisma.js';

export const createUserService = async (name, age, email) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                name: name,
                age: age,
                email: email,
            },
        });
        return newUser;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const getAllUsersService = async () => {
  try {
    const users = await prisma.user.findMany();
    return users;
  } catch (error) {
    console.error('Error fetching users:', error); 
    throw error;
  }
};

export const getUserByIdService = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    return user;
  } catch (error) {
    console.error('Error fetching user by ID:', error); 
    throw error;
  }
};

export const updateUserService = async (id, name, age, email) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        name: name,
        age: age,
        email: email,
      },
    });
    return updatedUser;
  } catch (error) {
    console.error('Error updating user:', error); 
    throw error;
  }
};

export const deleteUserService = async (id) => {
  try {
    const deletedUser = await prisma.user.delete({
      where: {
        id: parseInt(id),
      },
    });
    return deletedUser;
  } catch (error) {
    console.error('Error deleting user:', error); 
    throw error;
  }
};