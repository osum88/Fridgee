import {
  getFoodVariantByIdService,
  getAllFoodVariantsCatalogService,
  getActiveFoodVariantsService,
} from "../services/foodVariantService.js";
import handleResponse from "../utils/responseHandler.js";

// vrati variantu podle jejiho ID
export const getFoodVariantById = async (req, res, next) => {
  try {
    const { variantId } = req.params;

    const variant = await getFoodVariantByIdService(Number(variantId));
    handleResponse(res, 200, "Food variant fetched successfully", variant);
  } catch (err) {
    next(err);
  }
};

// vraci vsechny varianty katalogu podle kontextu
export const getAllFoodVariantsCatalog = async (req, res, next) => {
  try {
    const { foodCatalogId } = req.params;
    const isAdmin = req.adminRoute;

    const variants = await getAllFoodVariantsCatalogService(Number(foodCatalogId), isAdmin);
    handleResponse(res, 200, "All food variants fetched successfully", variants);
  } catch (err) {
    next(err);
  }
};

//vrati vsechny varianty v invenatri pro dane food
export const getActiveFoodVariants = async (req, res, next) => {
  try {
    const { foodCatalogId, inventoryId } = req.params;
    const isAdmin = req.adminRoute;
    const userId = req.userId;

    const variants = await getActiveFoodVariantsService(
      Number(inventoryId),
      Number(foodCatalogId),
      userId,
      isAdmin,
    );
    handleResponse(res, 200, "All food variants fetched successfully", variants);
  } catch (err) {
    next(err);
  }
};
