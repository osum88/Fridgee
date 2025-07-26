import { error } from "console";
import crypto from "crypto";
import dotenv from "dotenv";
import { buffer } from "stream/consumers";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const IV_KEY = process.env.IV_KEY;

const ALG = "aes-256-cbc";

if (ENCRYPTION_KEY.length !== 64) {
    console.warn("WARNING: ENCRYPTION_KEY should be 64 characters (32 bytes) long for AES-256.");
}
if (IV_KEY.length !== 32) {
    console.warn("WARNING: IV_KEY should be 32 characters (16 bytes) long for AES-256.");
}

export const encrypt = (text) => {
    if (text == null || typeof text == "undefined" || text == "") {
        console.warn("Attempted to encrypt null, undefined or empty text. Returning null.");
        return null;
    }
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(IV_KEY, "hex");

    const cipher = crypto.createCipheriv(ALG, key, iv);
    let encrypted = cipher.update(String(text), "utf-8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decrypt = (encryptedText) => {
    if (encryptedText == null || typeof encryptedText == "undefined" || encryptedText == "") {
        console.warn("Attempted to decrypt null, undefined or empty text. Returning null.");
        return null;
    }
    const key = Buffer.from(ENCRYPTION_KEY, "hex");
    const iv = Buffer.from(IV_KEY, "hex");

    try {
        const decipher = crypto.createDecipheriv(ALG, key, iv);
        let decrypted = decipher.update(encryptedText, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    } catch {
        console.error("Error decrypting data:", error.message);
        return null;
    }
};
