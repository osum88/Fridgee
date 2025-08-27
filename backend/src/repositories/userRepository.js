import prisma from "../utils/prisma.js";
import bcrypt from "bcrypt";
import { encrypt, decrypt } from "../utils/encryption.js"
import { NotFoundError } from "../errors/errors.js";

const SALT_ROUNDS = 11;

//vytvori uzivatele
export const createUserRepository = async (name, surname, username, birthDate, email, password, bankNumber, preferredLanguage) => {
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
                bankNumber: encrypt(bankNumber),
                preferredLanguage: preferredLanguage,   
            },
        });
        const { passwordHash: omittedPasswordHash, bankNumber: encryptedBankNumber, ...rest } = newUser; 
        return { ...rest, bankNumber: "***ENCRYPTED***" };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

//vrati vsechny uzivatele
export const getAllUsersRepository = async () => {
    try {
        const users = await prisma.user.findMany();
        if (!users) {
            throw new NotFoundError("Users not found");
        }
        return users.map(user => {
            const { passwordHash, verificationToken, passwordResetToken, bankNumber, ...rest } = user; 
        return rest; 
    });    
    } catch (error) {
        console.error("Error fetching users:", error); 
        throw error;
    }
};

//vrati uzivatele podle id
export const getUserByIdRepository = async (id) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id),
            },
            select: {
                id: true,
                name: true,
                surname: true,
                username: true,
                birthDate: true,
                email: true,
                profilePictureUrl: true,
                emailIsVerified: true,
                isAdmin: true,
                createdAt: true,
                lastLogin: true,
                preferredLanguage: true,
            },
        });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user; 
    } catch (error) {
        console.error("Error fetching user by ID:", error); 
        throw error;
    }
};

//updatuje uzivatele podle id
export const updateUserRepository = async (id, updateData) => {
    if (updateData.password) {
        updateData.passwordHash = await bcrypt.hash(updateData.password, SALT_ROUNDS);
        delete updateData.password; 
    }
    if (updateData.bankNumber) {
        updateData.bankNumber = encrypt(updateData.bankNumber);
    }
    const updatedUser = await prisma.user.update({
        where: { id: id },
        data: updateData,
        select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            birthDate: true,
            email: true,
            bankNumber: true,
            preferredLanguage: true,
            isAdmin: true,
        },
    });
    const { bankNumber, ...rest } = updatedUser;
    return { ...rest, bankNumber: "***ENCRYPTED***" };
};

//smaze uzivatele
export const deleteUserRepository = async (id) => {
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

//vraci bankovni cislo
export const getBankNumberRepository = async (id) => {
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

//vraci uzivatele podle emailu
export const getUserByEmailRepository = async (email) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                name: true,
                surname: true,
                username: true,
                birthDate: true,
                email: true,
                passwordHash: true, 
                profilePictureUrl: true,
                emailIsVerified: true,
                isAdmin: true,
                createdAt: true,
                lastLogin: true,
                preferredLanguage: true,
            },
        });
        return user; 
    } catch (error) {
        console.error("Error fetching user by email:", error);
        throw error;
    }
};

//vraci uzivatele podle username
export const getUserByUsernameRepository = async (username) => {
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

 
export const updateVerificationTokenRepository = async (id, verificationToken, tokenExpiresAt) => {
  try {
      const updatedVerificationToken = await prisma.user.update({
          where: {
              id: parseInt(id),
          },
          data: {
            verificationToken: verificationToken,
            tokenExpiresAt: tokenExpiresAt,
          }, 
      });
      return updatedVerificationToken;
  } catch (error) {
    console.error("Error updating verification token:", error); 
    throw error;
  }
};

export const updatePasswordResetTokenRepository = async (id, passwordResetToken, passwordResetExpiresAt) => {
  try {
      const updatedPasswordResetToken = await prisma.user.update({
          where: {
              id: parseInt(id),
          },
          data: {
            passwordResetToken: passwordResetToken,
            passwordResetExpiresAt: passwordResetExpiresAt,
          }, 
      });
      return updatedPasswordResetToken;
  } catch (error) {
    console.error("Error updating reset password token:", error); 
    throw error;
  }
};

//vrati id uzivatele podle verifikačniho email tokenu
export const getUserIdByVerificationTokenRepository = async (token) => {
  try {
      const user = await prisma.user.findFirst({ 
          where: {
              verificationToken: token,
              tokenExpiresAt: {
                gte: new Date(), 
              },
              emailIsVerified: false, 
          },
          select: {
            id: true,
          },
      });
      return user;          
  } catch (error) {
    console.error("Error fetching user ID:", error); 
    throw error;
  }
};

//vrati id uzivatele podle reset password tokenu
export const getUserByPasswordResetTokenRepository = async (token) => {
    try {
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpiresAt: {
                    gte: new Date(), 
                },
            },
            select: {
                id: true,
                email: true,
                preferredLanguage: true,
            },
        });
        return user; 
    } catch (error) {
        console.error("Error fetching user by password reset token:", error);
        throw error;
    }
};

//resetuje heslo 
export const resetPasswordInDbRepository = async (id, password) => {
    try {
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const resetPassword = await prisma.user.update({
            where: {
                id: id, 
            },
            data: {
                passwordHash: passwordHash,      
                passwordResetToken: null,     
                passwordResetExpiresAt: null,       
            },
            select: { 
                id: true,
                email: true,
            }
        });
        return resetPassword;
    } catch (error) {
        console.error("Error reset password:", error); 
        throw error;
    }
};

//nastavi overeni emailu
export const verifyUserEmailInDbRepository = async (id) => {
    try {
        const verifyUserEmail = await prisma.user.update({
            where: {
                id: id, 
            },
            data: {
                emailIsVerified: true,      
                verificationToken: null,     
                tokenExpiresAt: null,       
            },
            select: { 
                id: true,
                email: true,
                emailIsVerified: true,
                username: true 
            }
        });
        return verifyUserEmail;
    } catch (error) {
        console.error("Error verifying user email:", error); 
        throw error;
    }
};

//vrati preferovany jazyk
export const getPreferredLanguageByUserIdRepository = async (id) => {
    try {
        const user = await prisma.user.findUnique({ 
            where: {
                id: id,
            },
            select: {
                preferredLanguage: true,
            },
        });
        return user ? user.preferredLanguage : "en"; 
    } catch (error) {
        console.error("Error fetching preferred language:", error);
        throw error;
    }
};

//updatuje preferovany jazyk
export const updatePreferredLanguageByUserIdRepository = async (id, preferredLanguage) => {
    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: id,
            },
            data: {
                preferredLanguage: preferredLanguage,
            },
            select: {
                preferredLanguage: true,
            },
        });

        return updatedUser;
    } catch (error) {
        console.error("Error updating preferred language:", error);
        throw error;
    }
};


//vyhledává uzivatele podle username
export const searchUsersRepository = async (username, limit) => {
    try {
        const parsedLimit = parseInt(limit, 10) || 10; 
        const users = await prisma.user.findMany({ 
            where: {
                username: {
                    contains: username,
                    mode: "insensitive", 
                },
            },
            take: parsedLimit,
            orderBy: {
                username: "asc",
            },
            select: { 
                id: true,
                username: true,
                name: true,
                surname: true,
            },
        });
        return users;
    } catch (error) {
        console.error("Error searching users:", error);
        throw error;
    }
};  

//updatuje url user profilovaho obrazku
export const updateUserProfilePictureRepository = async (id, imageUrl) => {
    try {
        const updatedUser = await prisma.user.update({ 
            where: {
                id: id,
            },
            data: {
                profilePictureUrl: imageUrl,
            },
            select: { 
                id: true,
                profilePictureUrl: true,
            },
        });
        return updatedUser;
    } catch (error) {
        console.error("Error updating user profile image url:", error);
        throw error;
    }
};

export const updateLastLoginRepository = async (id) => {
    try {
        const updatedUser = await prisma.user.update({ 
            where: {
                id: id,
            },
            data: {
                lastLogin: new Date(),
            },
            select: { 
                id: true,
                lastLogin: true,
            },
        });
        return updatedUser;
    } catch (error) {
        console.error("Error updating last login:", error);
        throw error;
    }
};