
import { BadRequestError, ForbiddenError, UnauthorizedError } from "../errors/errors.js";
import { verifyToken } from "../utils/token.js";

export const authenticateToken = (req, res, next) => {    
    const authHeader = req.headers?.authorization;  //hlavicka z tokenu
    
    const token = authHeader?.startsWith("Bearer") ? authHeader.split(" ")[1] : null; 

    if (!token) {
        throw new UnauthorizedError("Access denied: No token provided");
    }
    const { decoded, error } = verifyToken(token);

    if (error) {
        if (error === "TokenExpired") {
            throw new UnauthorizedError("Access token expired");
        }
        throw new ForbiddenError("Invalid access token");
    }
    
    req.user = decoded;             // decoded obsahuje payload tokenu (id, email, isAdmin, username)
    next();
};

//overi admina a nastavi id (pro admin routy)
export const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        throw new ForbiddenError("Access denied: Administrator privileges required.");
    }

    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
        throw new BadRequestError("Invalid user ID provided.");
    }

    req.userId = userId;
    req.adminRoute = true;
    next();
};

//overi admina, slouzi pro admin routu ktera nema v url id
export const authorizeAdminWithOutId = (req, res, next) => {
    if (!req.user || !req.user.isAdmin) {
        throw new ForbiddenError("Access denied: Administrator privileges required.");
    }
    req.adminRoute = true;
    next();
};

//overi uzivatele a ulozi id (pro user routy)
export const authorizeUser = (req, res, next) => {
    if (!req.user) {
        throw new UnauthorizedError("Unauthorized: No user token provided.");
    }

    req.userId = req.user.id;
    req.adminRoute = false;
    next();
};