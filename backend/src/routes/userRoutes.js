import express from "express";
import { createUser, deleteUser, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfileImage, updatePreferredLanguageByUserId } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateLanguageSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

//vytvoreni uzivatele
router.post("/users", validate(createUserSchema), createUser);

//hledani podle username
router.get("/users/search", authenticateToken, authorizeUser, searchUsers);  
//http://localhost:3001/api/users/search?username=josef&limit=2

//vrati uzivatele podle id
router.get("/users", authenticateToken, authorizeUser, getUserById);

//zmeni profile image
router.patch("/users/profile-image", authenticateToken, authorizeUser, upload.single("file"), updateUserProfileImage);

//updatuje jazyk
router.patch("/users/language", validate(updateLanguageSchema), authenticateToken, authorizeUser, updatePreferredLanguageByUserId);

//updatuje uzivatele
router.patch("/users", validate(updateUserSchema), authenticateToken, authorizeUser, updateUser);

//smazani uzivatele
router.delete("/users", authenticateToken, authorizeUser, deleteUser);

//vrati bankovni cislo
router.get("/users/bank-number", authenticateToken, authorizeUser, getBankNumber);



export default router;