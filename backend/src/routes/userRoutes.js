import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfilePicture } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeAdmin, authorizeUser, authorizeUserOrAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/users", validate(createUserSchema), createUser);
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);   
router.get("/users/search", authenticateToken, searchUsers);
router.get("/users/:id", authenticateToken, authorizeUserOrAdmin, getUserById);

//TODO  middlevare pro profile picture
router.put("/users/profile-image", authenticateToken, /*tady upload middleware,*/ updateUserProfilePicture);

router.put("/users/:id", validate(updateUserSchema), authenticateToken, authorizeUserOrAdmin, updateUser);
router.delete("/users/:id", authenticateToken, authorizeUserOrAdmin, deleteUser);
router.get("/users/:id/bank-number", authenticateToken, authorizeUser, getBankNumber);



export default router;