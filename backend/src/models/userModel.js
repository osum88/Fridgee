import prisma from '../utils/prisma.js';

export const createUserService = async (name, surname, username, age, email, passwordHash, emailIsVerified, bankNumber, isAdmin) => {
    try {
        const newUser = await prisma.user.create({
            data: {
                name: name,
                surname: surname,
                username: username,
                age: age,
                email: email,
                passwordHash: passwordHash,
                emailIsVerified: emailIsVerified,
                bankNumber: bankNumber,    //tady se pak zasifruje encrypt(bankNumber)
                isAdmin: isAdmin,
            },
        });
        const { bankNumber: encryptedBankNumber, ...rest } = newUser; 
        return { ...rest, bankNumber: '***ENCRYPTED***' };
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const getAllUsersService = async () => {
  try {
    const users = await prisma.user.findMany();
    return users.map(user => {
        const { bankNumber, ...rest } = user; 
        return rest; 
    });    
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
    if (user) {
        const { bankNumber, ...rest } = user; 
        return rest; 
    }
    return null; 
  } catch (error) {
    console.error('Error fetching user by ID:', error); 
    throw error;
  }
};

export const updateUserService = async (id, name, surname, username, age, email, passwordHash, emailIsVerified, bankNumber, isAdmin) => {
  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
          name: name,
          surname: surname,
          username: username,
          age: age,
          email: email,
          passwordHash: passwordHash,
          emailIsVerified: emailIsVerified,
          bankNumber: bankNumber,    //tady se pak zasifruje encrypt(bankNumber)
          isAdmin: isAdmin,
      },
    });
    const { bankNumber: encryptedBankNumber, ...rest } = updatedUser; 
    return { ...rest, bankNumber: '***ENCRYPTED***' };
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
    if (deletedUser) {
        const { bankNumber, ...rest } = deletedUser; 
        return rest; 
    }
    return null; 
  } catch (error) {
    console.error('Error deleting user:', error); 
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
      return userWithBankNumber.bankNumber;          //tady se bude desifrovat decrypt(user.bankNumber);
  } catch (error) {
    console.error('Error fetching and decrypting bank number:', error); 
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
        console.error('Error fetching user by email:', error);
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
        console.error('Error fetching user by username:', error);
        throw error;
    }
};
