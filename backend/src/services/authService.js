import crypto from "crypto";
import bcrypt from "bcrypt";
import { getPreferredLanguageByUserIdRepository, getUserByEmailRepository, getUserByIdRepository, getUserByPasswordResetTokenRepository, getUserIdByVerificationTokenRepository, resetPasswordInDbRepository, updateLastLoginRepository, updatePasswordResetTokenRepository, updateVerificationTokenRepository, verifyUserEmailInDbRepository } from "../repositories/userRepository.js";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError } from "../errors/errors.js";
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail } from "../utils/emailService.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";
import { createRefreshTokenRepository, deleteAllRefreshTokensByUserIdRepository, deleteRefreshTokenByIdRepository, findRefreshTokenByIdRepository,  } from "../repositories/refreshTokenRepository.js";
import { createUserService } from "./userService.js";

export const signUpService = async ({username, email, password}) => {

    const sanitizedUsername = username.trim().replace(/\s+/g, "");

    // vytvoreni uzivatele
    const newUser = await createUserService(null, null, sanitizedUsername, null, email, password, null);

    // verifikace a odeslani emailu
    const verifyToken = crypto.randomBytes(32).toString("hex"); 
    const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
    await updateVerificationTokenRepository(newUser.id, verifyToken, tokenExpiresAt);
    
    const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verifyToken}`;
    const language = await getPreferredLanguageByUserIdRepository(newUser.id);
    // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
    // await sendVerificationEmail(newUser.email, verificationLink, language);

    // vytvoreni a ulozeni tokenu
    const accessToken = generateAccessToken(newUser);
    const { fullToken: refreshToken, tokenId, tokenHash } = await generateRefreshToken(newUser.id);
    await createRefreshTokenRepository(tokenId, tokenHash, newUser.id);
    
    const responseData = {
        accessToken,
        refreshToken,
        user: newUser,
    };
    return responseData;
};

export const loginService = async ({ email, password }) => {
    // overeni uzivatele
    const user = await getUserByEmailRepository(email);
    if (!user) {
        throw new BadRequestError("Wrong email or password");
    }

    // overeni hesla
    const isSame = await bcrypt.compare(password, user.passwordHash);
    if (!isSame) {
        throw new BadRequestError("Wrong email or password");
    }
    
    //verifikace emailu
    if (!user.emailIsVerified) {
        const verifyToken = crypto.randomBytes(32).toString("hex"); 
        const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000); //token plati 6h
        await updateVerificationTokenRepository(user.id, verifyToken, tokenExpiresAt);

        const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verifyToken}`;
        const language = await getPreferredLanguageByUserIdRepository(user.id);
        // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
        // await sendVerificationEmail(user.email, verificationLink, language);
    
        // throw new UnauthorizedError("Please verify your email address to continue.");
    }
    
    // update casu posledniho prihlaseni
    await updateLastLoginRepository(user.id);
    
    // vytvoreni a ulozeni tokenu
    const accessToken = generateAccessToken(user);
    const { fullToken: refreshToken, tokenId, tokenHash } = await generateRefreshToken(user.id);
    await createRefreshTokenRepository(tokenId, tokenHash, user.id);
    
    const { passwordHash, ...userWithoutPassword } = user;
    return {
        accessToken,
        refreshToken,
        user: userWithoutPassword,
    };
};

export const refreshService = async (refreshToken) => {
    // overeni tokenu
    if (!refreshToken) {
        throw new UnauthorizedError("Missing refresh token. Please log in again.");
    }

    const [tokenId, tokenSecret] = refreshToken.split(".");
    if (!tokenId || !tokenSecret) {
        throw new ForbiddenError("Invalid refresh token format.");
    }

    const foundToken = await findRefreshTokenByIdRepository(tokenId);
    if (!foundToken) {
        throw new ForbiddenError("Invalid or revoked refresh token. Please log in again.");
    }
    
    //kontrola expirace
    if (new Date() > foundToken.expiresAt) {
        await deleteRefreshTokenByIdRepository(foundToken.id);
        throw new UnauthorizedError("Refresh token expired. Please log in again.");
    }

    // porovna token s hashem
    const isMatch = await bcrypt.compare(tokenSecret, foundToken.tokenHash);
    if (!isMatch || !foundToken.isValid) {
        await deleteAllRefreshTokensByUserIdRepository(foundToken.userId);
        throw new ForbiddenError("Invalid refresh token. Please log in again.");
    }
    await deleteRefreshTokenByIdRepository(tokenId);
    const user = await getUserByIdRepository(foundToken.userId);

    //vytvareni novych tokenu
    const newAccessToken = generateAccessToken(user);
    const { fullToken: newRefreshToken, tokenId: newTokenId, tokenHash: newTokenHash } = await generateRefreshToken(foundToken.userId);
    await createRefreshTokenRepository(newTokenId, newTokenHash, foundToken.userId);

    return { newAccessToken, newRefreshToken };
};

export const logoutService = async (refreshToken) => {
    if (!refreshToken) {
        throw new UnauthorizedError("Missing refresh token. Cannot log out.");
    }
    
    const [tokenId] = refreshToken.split(".");
    
    if (tokenId) {
        await deleteRefreshTokenByIdRepository(tokenId);
    }
    return true;
};

export const verifyEmailService = async (token) => {
    
    const user = await getUserIdByVerificationTokenRepository(token);
    if (!user) {
        throw new NotFoundError("Invalid, expired, or already used verification token.");
    }
    await verifyUserEmailInDbRepository(user.id);

    return true
};

export const forgotPasswordService = async (email) => {
    
    //overeni uzivatle
    const user = await getUserByEmailRepository(email);
    if (!user) {
        throw new NotFoundError("User not found.");
    }

    // generovani tokenu 
    const resetPasswordToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minut
    
    // ulozeni tokenu 
    await updatePasswordResetTokenRepository(user.id, resetPasswordToken, tokenExpiresAt);
    
    // odkaz a jazyk
    const resetLink = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${resetPasswordToken}`;
    const language = await getPreferredLanguageByUserIdRepository(user.id);
    
    // odeslani emailu
    await sendPasswordResetEmail("josefnovak738@gmail.com", resetLink, language);
    // await sendPasswordResetEmail(user.email, resetLink, language);

    return true;
};

export const resetPasswordService = async (token, newPassword) => {
    
    //overeni uzivatele
    const user = await getUserByPasswordResetTokenRepository(token);
    if (!user) {
        throw new NotFoundError("Password has been reset successfully. You can now log in.");
    }

    //overeni expirace
    if (new Date() > user.passwordResetTokenExpiresAt) {
        throw new NotFoundError("Password has been reset successfully. You can now log in.");
    }
    //resetovani hesla
    await resetPasswordInDbRepository(user.id, newPassword);
    
    //smazani vsech refersh tokenu uzivatele
    await deleteAllRefreshTokensByUserIdRepository(user.id);
    
    //vyber jazyku
    const language = await getPreferredLanguageByUserIdRepository(user.id);
    await sendPasswordResetSuccessEmail(user.email, language);

    return true;
};

export const changePasswordService = async (email, oldPassword, newPassword) => {

    //overeni uzvitele
    const user = await getUserByEmailRepository(email);   //mozna vymenit za id
    if (!user) {
        return handleResponse(res, 404, "User not found");
    }

    //overeni stareho hesla
    const isSame = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isSame) {
        throw new UnauthorizedError("Wrong old password");
    }
    await resetPasswordInDbRepository(user.id, newPassword);

    // odeslani emailu o potvrzeni
    const language = await getPreferredLanguageByUserIdRepository(user.id);
    await sendPasswordResetSuccessEmail(user.email, language);
    
    // zneplatneni tokenu
    await deleteAllRefreshTokensByUserIdRepository(user.id);

    return true;
};