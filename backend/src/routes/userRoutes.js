import express from "express";
import { createUser, deleteUser, getAllUsersAdmin, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfilePicture, updatePreferredLanguageByUserId } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateLanguageSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeUser, authorizeUserOrAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();

//vytvoreni uzivatele
router.post("/users", validate(createUserSchema), createUser);

//hledani podle username
router.get("/users/search", authenticateToken, searchUsers);  
//http://localhost:3001/api/users/search?username=josef&limit=2

//vrati uzivatele podle id
router.get("/users", authenticateToken, authorizeUser, getUserById);

//TODO  middlevare pro profile picture
router.put("/users/profile-image", authenticateToken, /*tady upload middleware,*/ updateUserProfilePicture);

//updatuje jazyk
router.patch("/users/language", validate(updateLanguageSchema), authenticateToken, authorizeUser, updatePreferredLanguageByUserId);

//updatuje uzivatele
router.patch("/users", validate(updateUserSchema), authenticateToken, authorizeUser, updateUser);

//smazani uzivatele
router.delete("/users", authenticateToken, authorizeUser, deleteUser);

//vrati bankovni cislo
router.get("/users/bank-number", authenticateToken, authorizeUser, getBankNumber);



export default router;