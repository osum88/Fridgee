import express from "express";
import { createUser, deleteUser, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfileImage, updatePreferredLanguageByUserId, deleteUserProfileImage, getBankNumberPassword } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, getBankNumberPasswordSchema, updateLanguageSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import multer from "multer";
import { sanitize } from "../middlewares/sanitize.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateToken);
router.use(authorizeUser);

//vrati bankovni cislo po zadani hesla
router.post("/users/bank-number", sanitize, validate(getBankNumberPasswordSchema), getBankNumberPassword);

//vytvoreni uzivatele
router.post("/users", validate(createUserSchema), sanitize, createUser);

//hledani podle username
router.get("/users/search", sanitize, searchUsers);  
//http://localhost:3001/api/users/search?username=josef&limit=2

//vrati uzivatele podle id
router.get("/users", getUserById);

//zmeni profile image
router.patch("/users/profile-image", upload.single("file"), sanitize, updateUserProfileImage);

//smaže profile image
router.delete("/users/profile-image", deleteUserProfileImage);

//updatuje jazyk
router.patch("/users/language", sanitize, validate(updateLanguageSchema), updatePreferredLanguageByUserId);

//updatuje uzivatele
router.patch("/users", sanitize, validate(updateUserSchema), updateUser);

//smazani uzivatele
router.delete("/users", deleteUser);

//vrati bankovni cislo
router.get("/users/bank-number", getBankNumber);



export default router;