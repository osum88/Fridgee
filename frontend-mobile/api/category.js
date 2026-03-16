import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

//updatuje categorii
export const updateFoodCategoryApi = async (categoryId, data) => {
  try {
    const response = await apiClient.patch(`/food-category/${categoryId}`, data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) return null;
    console.error(
      `Error in updateFoodCategoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// smaze kategorii
export const deleteFoodCategoryApi = async (categoryId) => {
  try {
    const response = await apiClient.delete(`/food-category/${categoryId}`);
    return response.data;
  } catch (error) {
    if (isCancel(error)) return null;
    console.error(
      `Error in deleteFoodCategoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vytvori kategorii
export const createFoodCategoryApi = async (inventoryId, data) => {
  try {
    const response = await apiClient.post(`/food-category/`, { ...data, inventoryId });
    return response.data;
  } catch (error) {
    if (isCancel(error)) return null;
    console.error(
      `Error in createFoodCategoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
