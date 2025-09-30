import prisma from "../utils/prisma.js";

const SALT_ROUNDS = 11;
const DAYS_15 = 15 * 24 * 60 * 60 * 1000;

//vytvori refresh token
export const createRefreshTokenRepository = async (tokenId, tokenHash, userId) => {
    try {
        await prisma.refreshToken.create({
            data: {
                id: tokenId,
                tokenHash: tokenHash,
                userId: userId,
                expiresAt: new Date(Date.now() + DAYS_15),
                isValid: true,
            },
        });
        return true; 
    } catch(error) {
        console.error("Error creating refresh token in repository:", error);
        throw error;
    }
};

//vrati vsechny validni tokeny
export const getValidRefreshTokensByUserIdRepository = async (userId) => {
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

//smaze vsechny tokeny
export const deleteAllRefreshTokensByUserIdRepository = async (userId) => {
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

//smaze konkretni (id) token
export const deleteRefreshTokenByIdRepository = async (id) => {
    try {
        const refreshTokens = await prisma.refreshToken.deleteMany({
            where: {
                id: id,
            }
        });
    } catch (error) {
        console.error("Error deleting token:", error); 
        throw error;
    }
};

//najde konkretni token
export const findRefreshTokenByIdRepository = async (tokenId) => {
    try {
        const refreshTokens = await prisma.refreshToken.findUnique({
        where: { 
            id: tokenId, 
        },
        select: { 
            userId: true,
            tokenHash: true, 
            expiresAt: true,
            isValid: true,
        },
    });
    return refreshTokens
    } catch (error) {
        console.error("Error finding refresh token:", error); 
        throw error;
    }
};