import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from "../utils/encryption.js"

const SALT_ROUNDS = 11;

export const createUserService = async (name, surname, username, birthDate, email, password, emailIsVerified, bankNumber, isAdmin) => {
    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        const newUser = await prisma.user.create({
            data: {
                name: name,
                surname: surname,
                username: username,
                birthDate: birthDate,
                email: email,
                passwordHash: hashedPassword,
                emailIsVerified: emailIsVerified,
                bankNumber: encrypt(bankNumber),   
                isAdmin: isAdmin,
            },
        });
        const { passwordHash: omittedPasswordHash, bankNumber: encryptedBankNumber, ...rest } = newUser; 
        return { ...rest, bankNumber: "***ENCRYPTED***" };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const getAllUsersService = async () => {
  try {
    const users = await prisma.user.findMany();
    return users.map(user => {
        const { passwordHash, bankNumber, ...rest } = user; 
        return rest; 
    });    
  } catch (error) {
    console.error("Error fetching users:", error); 
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
    if (user) {
        const { passwordHash, bankNumber, ...rest } = user; 
        return rest; 
    }
    return null; 
  } catch (error) {
    console.error("Error fetching user by ID:", error); 
    throw error;
  }
};

export const updateUserService = async (id, name, surname, username, birthDate, email, password, emailIsVerified, bankNumber, isAdmin) => {
  try {
      let updateData = {
          name, surname, username, birthDate, email, emailIsVerified, isAdmin
      };

      if (password) { 
          updateData.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      }
      if (bankNumber) { 
          updateData.bankNumber = encrypt(bankNumber);   
      }

      const updatedUser = await prisma.user.update({
          where: {
              id: parseInt(id),
          },
          data: updateData, 
      });

      const { passwordHash: omittedPasswordHash, bankNumber: encryptedBankNumber, ...rest } = updatedUser;
      return { ...rest, bankNumber: "***ENCRYPTED***" };
  } catch (error) {
    console.error("Error updating user:", error); 
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
    if (deletedUser) {
        const { passwordHash, bankNumber, ...rest } = deletedUser; 
        return rest; 
    }
    return null; 
  } catch (error) {
    console.error("Error deleting user:", error); 
    throw error;
  }
};

export const getBankNumberService = async (id) => {
  try {
      const userWithBankNumber = await prisma.user.findUnique({ 
          where: {
              id: parseInt(id),
          },
          select: {
              bankNumber: true,
          },
      });
      if (!userWithBankNumber || !userWithBankNumber.bankNumber) {
          return null; 
      }
      return decrypt(userWithBankNumber.bankNumber);          
  } catch (error) {
    console.error("Error fetching and decrypting bank number:", error); 
    throw error;
  }
}

export const getUserByEmailService = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true, 
            },
        });
        return user; 
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
};

export const getUserByUsernameService = async (username) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            select: {
                id: true, 
            },
        });
        return user; 
    } catch (error) {
        console.error("Error fetching user by username:", error);
        throw error;
    }
};
