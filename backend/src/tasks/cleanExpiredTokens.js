import prisma from "../utils/prisma.js";

//uklizi expirovane a nevalidni tokeny po 24 hodinach zneplatneni
export const cleanExpiredRefreshTokens = async () => {
    try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000);
        
        const deletedTokens = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    // smaze, pokud od expirace uplynulo max 24 hodin
                    {
                        expiresAt: { lt: twentyFourHoursAgo },
                    },
                    // smaze pokud token je nevalidni a od token je vytvoreny vic jak 5 dni
                    {
                        isValid: false,
                        createdAt: { lte: fiveDaysAgo } 
                    },
                ],
            },
        });
        console.log(`Cleaned up ${deletedTokens.count} expired/invalid refresh tokens.`);
    } catch (error) {
        console.error("Error during refresh token cleanup:", error);
    }
};