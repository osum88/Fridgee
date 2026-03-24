import apiClient from "@/utils/api-client";
import { isCancel } from "axios";
import { buildFoodFormData } from "@/utils/buildFoodFormData";

// vrati vsechny labely uzivatele i ty co jsou v inventari
export const getAvailableFoodLabelsApi = async (params, signal) => {
  try {
    const response = await apiClient.get("/food-label/available", { params, signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getAvailableFoodLabelsApi).");
      return null;
    }
    console.error(
      `Error in getAvailableFoodLabelsApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//smaze food label
export const deleteFoodLabelApi = async (foodLabelId) => {
  try {
    const response = await apiClient.delete(`/food-label/${foodLabelId}`);
    return response.data;
  } catch (error) {
    console.error(`Error in deleteFoodLabelApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

//updatuje label
export const updateFoodLabelApi = async (foodLabelData, imageFormData = null) => {
  try {
    const response = await apiClient.patch(
      "/food-label",
      buildFoodFormData(foodLabelData, imageFormData),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  } catch (error) {
    console.error(`Error in updateFoodLabelApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

// vraci label
export const getFoodLabelApi = async (foodLabelId, signal) => {
  try {
    const response = await apiClient.get(`/food-label/${foodLabelId}`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getFoodLabelApi).");
      return null;
    }
    console.error(`Error in getFoodLabelApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};
