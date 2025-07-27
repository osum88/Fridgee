import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET; 

if (!JWT_SECRET) {
    console.error("Error: JWT_SECRET is not set");
    process.exit(1);
}

if (!JWT_REFRESH_SECRET) {
    console.error("Error: JWT_REFRESH_SECRET is not set");
    process.exit(1);
}

export const generateAuthToken = (user, type) => {
    const payload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        username: user.username,
    };
    let token; 

    if (type === "access") {
        token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    } else { 
        token = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: "15d" });
    }
    return token;
};

export const verifyToken = (token, type) => {
    try {
        let decoded; 
        if (type === "access") {
            decoded = jwt.verify(token, JWT_SECRET);
        } else { 
            decoded = jwt.verify(token, JWT_REFRESH_SECRET); 
        }
        return { decoded, error: null };
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { decoded: null, error: 'TokenExpired' };
        }
        if (error.name === 'JsonWebTokenError') {
            return { decoded: null, error: 'InvalidToken' };
        }
        return { decoded: null, error: 'GenericError' };
    }
};