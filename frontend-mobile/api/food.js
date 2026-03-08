import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

// prida food do invenatre, pripadne vytvori label,catalog, history, variant
export const addFoodToInventoryApi = async (foodData, imageFormData = null) => {
  try {
    const finalFormData = new FormData();

    // prekopiruje soubor z puvodnich formadata pokud existuje
    if (imageFormData && imageFormData._parts) {
      const filePart = imageFormData._parts.find((part) => part[0] === "file");
      if (filePart) {
        finalFormData.append("file", filePart[1]);
      }
    }

    Object.keys(foodData).forEach((key) => {
      const value = foodData[key];
      if (value !== undefined) {
        let formattedValue;
        if (value instanceof Date) {
          formattedValue = value.toISOString();
        } else if (value === null || value === "null" || value === "") {
          formattedValue = "";
        } else {
          formattedValue = value.toString();
        }
        finalFormData.append(key, formattedValue);
      }
    });

    const response = await apiClient.post("/food", finalFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in addFoodToInventoryApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// ziska detail food
export const getFoodDetailApi = async (inventoryId, foodId, signal) => {
  try {
    console.log("www")
    const response = await apiClient.get(`/inventory/${inventoryId}/food/${foodId}/detail`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getFoodDetailApi).");
      return null;
    }
    console.error(
      `Error in getFoodDetailApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vrati vsechny varianty v invenatri pro dane food
export const getFoodVariantsApi = async (inventoryId, catalogId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/catalog/${catalogId}`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getFoodVariantsApi).");
      return null;
    }
    console.error(
      `Error in getFoodVariantsApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};