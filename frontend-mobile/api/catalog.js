import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

// ziska data o produktu z katalogu na zaklade caroveho kodu
export const getFoodByBarcodeApi = async (barcode, inventoryId, signal) => {
  try {
    const response = await apiClient.get(
      `/food-catalog/barcode/${barcode}?inventoryId=${inventoryId}`,
      { signal },
    );
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getFoodByBarcodeApi).");
      return null;
    }
    console.error(
      `Error in getFoodByBarcodeApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
