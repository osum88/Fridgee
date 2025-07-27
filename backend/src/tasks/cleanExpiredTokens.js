import prisma from '../utils/prisma.js';

//uklizi expirovane a nevalidni tokeny po 24 hodinach zneplatneni
export const cleanExpiredRefreshTokens = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const deletedTokens = await prisma.refreshToken.deleteMany({
            where: {
                OR: [
                    { isValid: false }, 
                    { expiresAt: { lt: new Date() } } 
                ],
               createdAt: { lt: twentyFourHoursAgo } 
            }
        });
        console.log(`Cleaned up ${deletedTokens.count} expired/invalid refresh tokens.`);
    } catch (error) {
        console.error("Error during refresh token cleanup:", error);
    }
};