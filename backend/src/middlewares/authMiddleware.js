
import handleResponse from '../utils/responseHandler.js';
import { verifyToken } from '../utils/token.js';

export const authenticateToken = (req, res, next) => {    
    const authHeader = req.headers?.authorization;  //hlavicka z tokenu
    
    const token = authHeader?.startsWith("Bearer") ? authHeader.split(' ')[1] : null; 

    if (!token) {
        return handleResponse(res, 401, "Access denied: No token provided");
    }
    const { decoded, error } = verifyToken(token, "access");

    if (error) {
        if (error === 'TokenExpired') {
            return handleResponse(res, 401, "Refresh token expired");
        }
        return handleResponse(res, 403, "Invalid refresh token");
    }
    req.user = decoded;             // decoded obsahuje payload tokenu (id, email, isAdmin, username)
    next();
};

export const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return handleResponse(res, 403, "Access denied: Administrator privileges required");
    }
    next();
};

export const authorizeUserOrAdmin = (req, res, next) => {
    if (req.user.id != req.params.id && !req.user.isAdmin) {
        return handleResponse(res, 403, "You are not authorized to use this service.");
    }
    next();
};

export const authorizeUser = (req, res, next) => {
    if (req.user.id != req.params.id) {
        return handleResponse(res, 403, "You are not authorized to use this service.");
    }
    next();
};