import express from "express";
import { authenticateToken, authorizeUser } from "../middlewares/authMiddleware.js";
import validate from "../middlewares/validator.js";
import { sanitize } from "../middlewares/sanitize.js";
import { addFoodInstanceSchema, consumeFoodInstanceSchema, deleteFoodInstancesSchema, duplicateInstancesSchema, updateFoodInstanceSchema } from "../validation/foodInstanceValidation.js";
import { consumeMultipleFoodInstances, deleteFoodInstances, duplicateFoodInstances, updateFoodInstance } from "../controllers/foodInstanceController.js";
import { addFoodInstance } from "../controllers/foodController.js";

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeUser);
router.use(sanitize);

// smaze foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
router.patch("/consume", validate(consumeFoodInstanceSchema), consumeMultipleFoodInstances);

//updatuje jednu nebo vice stejnych instanci
router.patch("/", validate(updateFoodInstanceSchema), updateFoodInstance);

//duplikuje instance food
router.post("/duplicate", validate(duplicateInstancesSchema), duplicateFoodInstances);

//smaze jednu nebo vice instanci
router.delete("/", validate(deleteFoodInstancesSchema), deleteFoodInstances);

// prida instanci food
router.post("/", validate(addFoodInstanceSchema), addFoodInstance);


export default router;

