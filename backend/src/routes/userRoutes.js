import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getBankNumber } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateUserSchema } from "../validation/userValidation.js";
import { authenticateToken, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/users", validate(createUserSchema), createUser);
router.get("/users", authenticateToken, authorizeAdmin, getAllUsers);   //autorizace ze je uzivatel admin
router.get("/users/:id", authenticateToken, getUserById);
router.put("/users/:id", authenticateToken, validate(updateUserSchema), updateUser);
router.delete("/users/:id", authenticateToken, deleteUser);
router.get("/users/:id/bank-number", authenticateToken, getBankNumber);

export default router;