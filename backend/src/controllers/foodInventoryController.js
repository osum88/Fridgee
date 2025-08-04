import { createFoodInventoryService } from "../models/foodInventoryModel.js";
import handleResponse from "../utils/responseHandler.js";

export const createFoodInventory = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { title, label } = req.body;

        const foodInventory = await createFoodInventoryService(userId, title, label);

        handleResponse(res, 201, "Food inventory created successfully", foodInventory);

    }
    catch(err){
        next(err);
    }
};
