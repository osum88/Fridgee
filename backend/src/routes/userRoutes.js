import express from "express";
import { createUser, deleteUser, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfileImage, updatePreferredLanguageByUserId, deleteUserProfileImage, getBankNumberPassword } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, getBankNumberPasswordSchema, updateLanguageSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//vrati bankovni cislo po zadani hesla
router.post("/users/bank-number", validate(getBankNumberPasswordSchema), authenticateToken, sanitize, authorizeUser, getBankNumberPassword);

//vytvoreni uzivatele
router.post("/users", validate(createUserSchema), sanitize, createUser);

//hledani podle username
router.get("/users/search", authenticateToken, sanitize, authorizeUser, searchUsers);  
//http://localhost:3001/api/users/search?username=josef&limit=2

//vrati uzivatele podle id
router.get("/users", authenticateToken, authorizeUser, getUserById);

//zmeni profile image
router.patch("/users/profile-image", authenticateToken, authorizeUser, upload.single("file"), updateUserProfileImage);

//smaže profile image
router.delete("/users/profile-image", authenticateToken, authorizeUser, deleteUserProfileImage);

//updatuje jazyk
router.patch("/users/language", validate(updateLanguageSchema), authenticateToken, sanitize, authorizeUser, updatePreferredLanguageByUserId);

//updatuje uzivatele
router.patch("/users", validate(updateUserSchema), authenticateToken, sanitize, authorizeUser, updateUser);

//smazani uzivatele
router.delete("/users", authenticateToken, authorizeUser, deleteUser);

//vrati bankovni cislo
router.get("/users/bank-number", authenticateToken, authorizeUser, getBankNumber);



export default router;