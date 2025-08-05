import crypto from 'crypto';
import { createUserRepository, getPreferredLanguageByUserIdService, getUserByEmailRepository, getUserByUsernameRepository, updateVerificationTokenService } from '../repositories/userRepository.js';
import { ConflictError } from '../errors/errors.js';
import { sendVerificationEmail } from '../utils/emailService.js';
import { generateAuthToken } from '../utils/token.js';
import { createRefreshTokenService } from '../repositories/refreshTokenService.js';

export const signUpService = async ({username, email, password, clientType}) => {

    const sanitizedUsername = username.trim().replace(/\s+/g, "");

    //kontrola duplicit
    const existingUserByEmail = await getUserByEmailRepository(email);
    if (existingUserByEmail) {
        throw new ConflictError("A user with this email already exists");
    }

    const existingUserByUsername = await getUserByUsernameRepository(sanitizedUsername);
    if (existingUserByUsername) {
        throw new ConflictError("A user with this username already exists");
    }

    // vytvoreni uzivatele
    const newUser = await createUserRepository(null, null, sanitizedUsername, null, email, password, null);

    // verifikace a odeslani emailu
    const verifyToken = crypto.randomBytes(32).toString("hex"); 
    const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
    await updateVerificationTokenService(newUser.id, verifyToken, tokenExpiresAt);
    
    const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verifyToken}`;
    const language = await getPreferredLanguageByUserIdService(newUser.id);
    // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
    // await sendVerificationEmail(newUser.email, verificationLink, language);

    // vytvoreni a ulozeni tokenu
    const accessToken = generateAuthToken(newUser, "access");
    const refreshToken = generateAuthToken(newUser, "refresh");
    await createRefreshTokenService(refreshToken, newUser.id);
    
    const responseData = {
        accessToken,
        refreshToken,
        user: newUser,
    };
    return responseData;
};