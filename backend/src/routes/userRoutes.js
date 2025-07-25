import express from "express";
import { createUser, deleteUser, getAllUsers, getUserById, updateUser, getBankNumber } from "../controllers/userController.js";
import validate from "../middlewares/validator.js";
import { createUserSchema, updateUserSchema } from "../validation/userValidation.js";

const router = express.Router();

router.post("/user", validate(createUserSchema), createUser);
router.get("/user", getAllUsers);   //autorizace ze je uzivatel admin
router.get("/user/:id", getUserById);
router.put("/user/:id", validate(updateUserSchema), updateUser);
router.delete("/user/:id", deleteUser);
router.get("/user/:id/bank-number", getBankNumber);

export default router;