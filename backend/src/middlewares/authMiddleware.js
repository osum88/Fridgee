
import handleResponse from '../utils/responseHandler.js';
import { verifyToken } from '../utils/token.js';

export const authenticateToken = (req, res, next) => {    
    const authHeader = req.headers?.authorization;  //hlavicka z tokenu
    
    const token = authHeader?.startsWith("Bearer") ? authHeader.split(' ')[1] : null; 

    if (!token) {
        return handleResponse(res, 401, "Access denied: No token provided");
    }
    const decoded = verifyToken(token);

    if (!decoded) {
        return handleResponse(res, 403, "Access denied: Invalid or expired token");
    }
    req.user = decoded;             // decoded obsahuje payload tokenu (id, email, isAdmin, username)
    console.log(decoded,"------------------------------------------------------------");
    next();
};

export const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        return handleResponse(res, 403, "Access denied: Administrator privileges required");
    }
    next();
};