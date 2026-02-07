import {  deleteFoodCatalogService, getAllFoodCatalogsByUserService, getFoodCatalogByIdService} from "../services/foodCatalogService.js";
import handleResponse from "../utils/responseHandler.js";


//vraci food catalog podle id
export const getFoodCatalogById = async (req, res, next) => {
    try {
        const { foodCatalogId } = req.params;
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const catalog = await getFoodCatalogByIdService(Number(foodCatalogId), userId, isAdmin);
        handleResponse(res, 200, "Food catalog fetched successfully", catalog);
    } catch (err) {
        next(err);
    }
};

//vraci vsechny catalogy usera
export const getAllFoodCatalogsByUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const catalogs = await getAllFoodCatalogsByUserService(userId, isAdmin);
    handleResponse(res, 200, "Food catalogs fetched successfully", catalogs);
  } catch (err) {
    next(err);
  }
};




