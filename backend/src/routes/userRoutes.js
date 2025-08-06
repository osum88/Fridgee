import express from "express";
import { createUser, deleteUser, getAllUsersAdmin, getUserById, updateUser, getBankNumber, searchUsers, updateUserProfilePicture } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeUser, authorizeUserOrAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();

router.post("/users", validate(createUserSchema), createUser);
router.get("/users/search", authenticateToken, searchUsers);
router.get("/users", authenticateToken, getUserById);

//TODO  middlevare pro profile picture
router.put("/users/profile-image", authenticateToken, /*tady upload middleware,*/ updateUserProfilePicture);

router.put("/users", validate(updateUserSchema), authenticateToken, updateUser);
router.delete("/users/:id", authenticateToken, authorizeUserOrAdmin, deleteUser);
router.get("/users/:id/bank-number", authenticateToken, authorizeUser, getBankNumber);



export default router;