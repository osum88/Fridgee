import bcrypt from "bcrypt";
import prisma from "../utils/prisma.js";

const SALT_ROUNDS = 11;
const DAYS_15 = 15 * 24 * 60 * 60 * 1000;

export const createRefreshTokenService = async (token, userId) => {
    try {
        const tokenHash = await bcrypt.hash(token, SALT_ROUNDS);

        const newRefreshToken = await prisma.refreshToken.create({
            data: {
                tokenHash: tokenHash,
                userId: userId,
                expiresAt: new Date(Date.now() + DAYS_15),
                isValid: true,
            },
        });
        return newRefreshToken
    } catch(error) {
        console.error("Error creating refresh token:", error);
        throw error;
    }
};

export const getValidRefreshTokensByUserIdService = async (userId) => {
    try {
        const refreshTokens = await prisma.refreshToken.findMany({
            where: {
                userId: userId,
                isValid: true,
            }
        });
        return refreshTokens;
    } catch (error) {
        console.error("Error fetching valid tokens:", error); 
        throw error;
    }
};

export const invalidateAllRefreshTokensByUserIdService = async (userId) => {
    try {
        const refreshTokens = await prisma.refreshToken.deleteMany({
            where: {
                userId: userId,
            }
        });
    } catch (error) {
        console.error("Error deleting tokens:", error); 
        throw error;
    }
};

export const invalidateRefreshTokenByIdService = async (id) => {
    try {
        const refreshTokens = await prisma.refreshToken.delete({
            where: {
                id: id,
            }
        });
    } catch (error) {
        console.error("Error deleting token:", error); 
        throw error;
    }
};
