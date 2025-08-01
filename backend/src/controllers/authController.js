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

        const sanitizedUsername = username.trim().replace(/\s+/g, "");

        const existingUserByEmail = await getUserByEmailService(email);
        if (existingUserByEmail) {
            return handleResponse(res, 409, "A user with this email already exists"); 
        }

        const existingUserByUsername = await getUserByUsernameService(sanitizedUsername);
        if (existingUserByUsername) {
            return handleResponse(res, 409, "A user with this username already exists"); 
        }
      
        const newUser = await createUserService(null, null, sanitizedUsername, null, email, password, null);

        //verifikace emailu
        const verifyToken = crypto.randomBytes(32).toString("hex"); 
        const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
        await updateVerificationTokenService(newUser.id, verifyToken, tokenExpiresAt);

        const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verifyToken}`;
        const language = await getPreferredLanguageByUserIdService(newUser.id);
        // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
        // await sendVerificationEmail(newUser.email, verificationLink, language);

        const accessToken = generateAuthToken(newUser, "access");
        const refreshToken = generateAuthToken(newUser, "refresh");

        await createRefreshTokenService(refreshToken, newUser.id);

        const clientType = req.headers["x-client-type"];

        if (clientType === "mobile") {
            // pro mobil tokeny v JSON těle
            return handleResponse(res, 201, "User created successfully", { 
                accessToken, 
                refreshToken, 
                user: newUser 
            });
        } 
        else { 
            // pro web se refresh token nastavi do HTTP-only cookie kvuli XSS utokum
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "Lax",
                maxAge: 15 * 24 * 60 * 60 * 1000 
            });
            return handleResponse(res, 201, "User created successfully", { 
                accessToken, 
                user: newUser 
            });
        }
        
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
            const verifyToken = crypto.randomBytes(32).toString("hex"); 
            const tokenExpiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);   //token plati 6h
            await updateVerificationTokenService(user.id, verifyToken, tokenExpiresAt);

            const verificationLink = `${process.env.FRONTEND_URL}/api/auth/verify-email?token=${verifyToken}`;
            const language = await getPreferredLanguageByUserIdService(user.id);
            // await sendVerificationEmail("josefnovak738@gmail.com", verificationLink, language);
            // await sendVerificationEmail(user.email, verificationLink, language);
        }

        const accessToken = generateAuthToken(user, "access");
        const refreshToken = generateAuthToken(user, "refresh"); 
        await createRefreshTokenService(refreshToken, user.id);

        const { passwordHash, ...userWithoutPassword } = user;

        const clientType = req.headers["x-client-type"];

        if (clientType === "mobile") {
            // pro mobil tokeny v JSON těle
            return handleResponse(res, 200, "Login successful", { 
                accessToken, 
                refreshToken, 
                user: userWithoutPassword 
            });
        } 
        else { 
            // pro web se refresh token nastavi do HTTP-only cookie
            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "Lax",
                maxAge: 15 * 24 * 60 * 60 * 1000 
            });
            return handleResponse(res, 200, "Login successful", { 
                accessToken, 
                user: userWithoutPassword 
            });
        }
    } 
    catch(err){
        next(err);
    }
};

export const refresh = async (req, res, next ) => {
    try {
        let refreshToken;
        const clientType = req.headers["x-client-type"];

        if (clientType === "mobile") {
            refreshToken = req.body.refreshToken;
        } else {
            refreshToken = req.cookies.refreshToken;
        }

        if (!refreshToken){
            return handleResponse(res, 401, "Missing refresh token. Please log in again.");
        }
        const { decoded, error } = verifyToken(refreshToken, "refresh")

        if (error) {
            if (error === "TokenExpired") {
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
            if (clientType !== "mobile") {                          // vycisti cookies pro web
                res.clearCookie("refreshToken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Lax",
                });
            }
            return handleResponse(res, 403, "Invalid or revoked refresh token. Please log in again.");
        }

        await deleteRefreshTokenByIdService(foundValidToken.id);

        const newAccessToken = generateAuthToken(user, "access");
        const newRefreshToken = generateAuthToken(user, "refresh"); 
        await createRefreshTokenService(newRefreshToken, user.id);

        if (clientType === "mobile") {
            // pro mobil tokeny v JSON těle
            return handleResponse(res, 200, "Tokens refreshed successfully", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            });
        } 
        else {
            // pro web se refresh token nastavi do HTTP-only cookie
            res.cookie("refreshToken", newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Lax", 
                maxAge: 15 * 24 * 60 * 60 * 1000 
            });
            return handleResponse(res, 200, "Tokens refreshed successfully", {
                accessToken: newAccessToken
            });
        }
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
        console.error("Error during email verification:", err);
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

        const resetPasswordToken = crypto.randomBytes(32).toString("hex");
        const tokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); 
        await updatePasswordResetTokenService(user.id, resetPasswordToken, tokenExpiresAt);

        const resetLink = `${process.env.FRONTEND_URL}/api/auth/reset-password?token=${resetPasswordToken}`;
        const language = await getPreferredLanguageByUserIdService(user.id);
        await sendPasswordResetEmail("josefnovak738@gmail.com", resetLink, language);
        // await sendPasswordResetEmail(email, resetLink, language);

        return handleResponse(res, 200, "Password reset link has been sent.");
    } catch (err) {
        console.error("Forgot password error:", err); 
        next(err); 
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        const user = await getUserByPasswordResetTokenService(token);
        if (!user) {
            return handleResponse(res, 400, "If the email address exists, a password reset link has been sent to it.");
        }
        await resetPasswordInDbService(user.id, newPassword);
        const language = await getPreferredLanguageByUserIdService(user.id);
        await sendPasswordResetSuccessEmail(user.email, language);
        await deleteAllRefreshTokensByUserIdService(user.id);
        return handleResponse(res, 200, "If the email address exists, a password reset link has been sent to it");
    } catch (err) {
        console.error("Error during password reset:", err);
        next(err); 
    }
};

export const changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        const user = await getUserByEmailService(req.user.email);   //mozna vymenit za id
        if (!user) {
            return handleResponse(res, 404, "User not found");
        }

        const isSame = await bcrypt.compare(oldPassword, user.passwordHash);
        if(!isSame) {
            return handleResponse(res, 400, "Wrong old password");
        }
        await resetPasswordInDbService(user.id, newPassword);
        const language = await getPreferredLanguageByUserIdService(user.id);
        await sendPasswordResetSuccessEmail(user.email, language);
        await deleteAllRefreshTokensByUserIdService(user.id);
        return handleResponse(res, 200, "Password has been successfully changed");

    } catch (err) {
        console.error("Error during password reset:", err);
        next(err); 
    }
};
        