import apiClient from "@/utils/api-client";
import { isCancel } from "axios";
import { buildFoodFormData } from "@/utils/buildFoodFormData";

// prida food do invenatre, pripadne vytvori label,catalog, history, variant
export const addFoodToInventoryApi = async (foodData, imageFormData = null) => {
  try {
    const response = await apiClient.post("/food", buildFoodFormData(foodData, imageFormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in addFoodToInventoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// updatuje food do invenatre, pripadne vytvori label,catalog, history, variant
export const updateFoodApi = async (foodData, imageFormData = null) => {
  try {
    const response = await apiClient.patch("/food", buildFoodFormData(foodData, imageFormData), {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    console.error(`Error in updateFoodApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

// ziska detail food
export const getFoodDetailApi = async (inventoryId, foodId, signal) => {
  try {
    console.log("www");
    const response = await apiClient.get(`/inventory/${inventoryId}/food/${foodId}/detail`, {
      signal,
    });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getFoodDetailApi).");
      return null;
    }
    console.error(`Error in getFoodDetailApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

//vrati vsechny varianty v invenatri pro dane food
export const getFoodVariantsApi = async (inventoryId, catalogId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/catalog/${catalogId}`, {
      signal,
    });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getFoodVariantsApi).");
      return null;
    }
    console.error(`Error in getFoodVariantsApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};
