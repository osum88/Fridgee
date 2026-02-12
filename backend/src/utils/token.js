import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET is not set");
    process.exit(1);
}

export const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        username: user.username,
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    return token;
};

export const generateRefreshToken = async (userId) => {
    const tokenId = uuidv4();
    const tokenSecret = crypto.randomBytes(32).toString("hex");
    const fullToken = `${tokenId}.${tokenSecret}`;
    const tokenHash = await bcrypt.hash(tokenSecret, 11);

    return { fullToken, tokenId, tokenHash };
};

export const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { decoded, error: null };
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return { decoded: null, error: "TokenExpired" };
        }
        if (error.name === "JsonWebTokenError") {
            return { decoded: null, error: "InvalidToken" };
        }
        return { decoded: null, error: "GenericError" };
    }
};