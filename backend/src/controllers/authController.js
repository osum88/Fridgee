import { createUserService, getUserByEmailService, getUserByIdService, getUserByUsernameService } from "../models/userModel.js";
import handleResponse from "../utils/responseHandler.js"
import bcrypt from "bcrypt";
import { generateAuthToken, verifyToken } from "../utils/token.js";
import { createRefreshTokenService, getValidRefreshTokensByUserIdService, invalidateAllRefreshTokensByUserIdService, invalidateRefreshTokenByIdService } from "../models/refreshTokenModel.js";

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
            await invalidateAllRefreshTokensByUserIdService(user.id);
            return handleResponse(res, 403, "Invalid or revoked refresh token. Please log in again.");
        }

        await invalidateRefreshTokenByIdService(foundValidToken.id);

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
        await invalidateAllRefreshTokensByUserIdService(userId);

        return handleResponse(res, 200, "Logout successful");
    } catch (err) {
        console.error("Error during logout:", err);
        next(err);
    }
};