import { createUserService, getPreferredLanguageByUserIdService, getUserByEmailService, getUserByIdService, getUserByPasswordResetTokenService, getUserByUsernameService, getUserIdByVerificationTokenService, resetPasswordInDbService, updatePasswordResetTokenService, updateUserService, updateVerificationTokenService, verifyUserEmailInDbService } from "../models/userModel.js";
import handleResponse from "../utils/responseHandler.js"
import bcrypt from "bcrypt";
import { generateAuthToken, verifyToken } from "../utils/token.js";
import { createRefreshTokenService, getValidRefreshTokensByUserIdService, deleteAllRefreshTokensByUserIdService, deleteRefreshTokenByIdService } from "../models/refreshTokenModel.js";
import crypto from "crypto"
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendVerificationEmail } from "../utils/emailService.js";

export const signUp = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const existingUserByEmail = await getUserByEmailService(email);
        if (existingUserByEmail) {
            return handleResponse(res, 409, "A user with this email already exists"); 
        }

        const existingUserByUsername = await getUserByUsernameService(username);
        if (existingUserByUsername) {
            return handleResponse(res, 409, "A user with this username already exists"); 
        }
      
        const newUser = await createUserService(null, null, username, null, email, password, false, null, false);

        //verifikace emailu
        const verifyToken = crypto.randomBytes(32).toString('hex'); 
        const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
        await updateVerificationTokenService(newUser.id, verifyToken, tokenExpiresAt);

        const verificationLink = `${process.env.WEB_URL}/api/auth/verify-email?token=${verifyToken}`;
        const language = await getPreferredLanguageByUserIdService(newUser.id);
        await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
        // await sendVerificationEmail(newUser.email, verificationLink, language);

        const accessToken = generateAuthToken(newUser, "access");
        const refreshToken = generateAuthToken(newUser, "refresh");

        await createRefreshTokenService(refreshToken, newUser.id);
        handleResponse(res, 201, "User created successfully", { accessToken, refreshToken, user: newUser });
    } 
    catch(err){
        next(err);
    }
};

export const login = async (req, res, next ) => {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmailService(email);
        if (!user){
            return handleResponse(res, 400, "Wrong email or password");
        }

        const isSame = await bcrypt.compare(password, user.passwordHash);
        if(!isSame) {
            return handleResponse(res, 400, "Wrong email or password");
        }

        //verifikace emailu
        if (!user.emailIsVerified){
            const verifyToken = crypto.randomBytes(32).toString('hex'); 
            const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
            await updateVerificationTokenService(user.id, verifyToken, tokenExpiresAt);

            const verificationLink = `${process.env.WEB_URL}/api/auth/verify-email?token=${verifyToken}`;
            const language = await getPreferredLanguageByUserIdService(user.id);
            // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
            // await sendVerificationEmail(user.email, verificationLink, language);
        }

        const accessToken = generateAuthToken(user, "access");
        const refreshToken = generateAuthToken(user, "refresh"); 
        await createRefreshTokenService(refreshToken, user.id);

        const { passwordHash, ...userWithoutHash } = user;
        return handleResponse(res, 200, "Login successful", { accessToken, refreshToken, user: userWithoutHash });
    } 
    catch(err){
        next(err);
    }
};

export const refresh = async (req, res, next ) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken){
            return handleResponse(res, 401, "Missing refresh token. Please log in again.");
        }
        const { decoded, error } = verifyToken(refreshToken, "refresh")

        if (error) {
            if (error === 'TokenExpired') {
                return handleResponse(res, 401, "Refresh token expired. Please log in again.");
            }
            return handleResponse(res, 403, "Invalid refresh token. Please log in again.");
        }

        const user = await getUserByIdService(decoded.id);

        if (!user) {
            return handleResponse(res, 404, "User not found.");
        }

        //refresh token rotace
        const allValidRefreshTokens = await getValidRefreshTokensByUserIdService(user.id);

        let foundValidToken = null;
        for (const validRefreshTokens of allValidRefreshTokens) {
            const isMatch = await bcrypt.compare(refreshToken, validRefreshTokens.tokenHash);
            if (isMatch) {
                foundValidToken = validRefreshTokens;
                break; 
            }
        }
        if (!foundValidToken || !foundValidToken.isValid) {
            await deleteAllRefreshTokensByUserIdService(user.id);
            return handleResponse(res, 403, "Invalid or revoked refresh token. Please log in again.");
        }

        await deleteRefreshTokenByIdService(foundValidToken.id);

        const newAccessToken = generateAuthToken(user, "access");
        const newRefreshToken = generateAuthToken(user, "refresh"); 
        await createRefreshTokenService(newRefreshToken, user.id);

        return handleResponse(res, 200, "Tokens refreshed successfully", { 
            accessToken : newAccessToken, 
            refreshToken : newRefreshToken
        });
    } 
    catch(err){
        next(err);
    }
};

export const logout = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        if (!userId) {
            return handleResponse(res, 400, "Invalid user ID provided");
        }
        await deleteAllRefreshTokensByUserIdService(userId);

        return handleResponse(res, 200, "Logout successful");
    } catch (err) {
        console.error("Error during logout:", err);
        next(err);
    }
};

export const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query;
        const user = await getUserIdByVerificationTokenService(token);
        if (!user) {
            return handleResponse(res, 400, "Invalid, expired, or already used verification token.");
        }
        await verifyUserEmailInDbService(user.id);

        return handleResponse(res, 200, "Email successfully verified! You can now log in.");
    } catch (err) {
        handleResponse(res, 500, "Server error during email verification");
        next(err);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await getUserByEmailService(email);
        if (!user) {
            return handleResponse(res, 404, "User not found.");
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
        await updatePasswordResetTokenService(user.id, resetPasswordToken, tokenExpiresAt);

        const resetLink = `${process.env.WEB_URL}/api/auth/reset-password?token=${resetPasswordToken}`;
        const language = await getPreferredLanguageByUserIdService(user.id);
        await sendPasswordResetEmail("josefnovak738@gmail.com", resetLink, language);
        // await sendPasswordResetEmail(email, resetLink, language);

        return handleResponse(res, 200, "Password reset link has been sent.");
    } catch (err) {
        console.error("Forgot password error:", err); 
        handleResponse(res, 500, "Server error during password reset request.");
        next(err); 
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        const user = await getUserByPasswordResetTokenService(token);
        if (!user) {
            return handleResponse(res, 400, "Invalid, expired, or already used verification token.");
        }
        await resetPasswordInDbService(user.id, newPassword);
        const language = await getPreferredLanguageByUserIdService(user.id);
        await sendPasswordResetSuccessEmail(user.email, language);
        return handleResponse(res, 200, "Password has been successfully reset.");
    } catch (err) {
        handleResponse(res, 500, "Server error during password reset.");
        next(err); 
    }
};
        