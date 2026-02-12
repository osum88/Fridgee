import { getFoodCatalogWithLabelByBarcodeService } from "../services/foodCatalogService.js";
import handleResponse from "../utils/responseHandler.js";

//vraci food catalog podle id
export const getFoodCatalogWithLabelByBarcode = async (req, res, next) => {
  try {
    const { inventoryId = null } = req.query;
    const { barcode } = req.params;
    const userId = req.userId;
    const isAdmin = req.adminRoute;

    const parsedInventoryId =
      inventoryId === "null" || !inventoryId ? null : parseInt(inventoryId, 10);

    const catalog = await getFoodCatalogWithLabelByBarcodeService(
      barcode,
      parsedInventoryId,
      userId,
      isAdmin,
    );
    handleResponse(res, 200, "Food catalog fetched successfully", catalog);
  } catch (err) {
    next(err);
  }
};
