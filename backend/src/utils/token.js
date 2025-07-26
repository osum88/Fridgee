import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("Error JWT_SECRET is not set");
    process.exit(1);
}

export const generateAuthToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        username: user.username,
    };
    const token = jwt.sign(payload, JWT_SECRET, {expiresIn: "1h" });
    return token;
};

export const verifyToken = (token) => {
    try {
        const decode = jwt.verify(token, JWT_SECRET);
        return decode;
    } catch (error) {
        console.error("Error validating JWT token:", error.message);
        return null;
    }
};