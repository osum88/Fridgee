import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

//updatuje insatnce
export const updateFoodInstanceApi = async (data, signal) => {
  try {
    console.log("data", data)
    const response = await apiClient.patch(`/food-instance/`, data, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (updateFoodInstanceApi).");
      return null;
    }
    console.error(
      `Error in updateFoodInstanceApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// zkonzumuje foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const consumeFoodInstanceApi = async (data, signal) => {
  try {
    const response = await apiClient.patch(`/food-instance/consume`, data, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (consumeFoodInstanceApi).");
      return null;
    }
    console.error(`Error in consumeFoodInstanceApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

//duplikuje instance food
export const duplicateFoodInstanceApi = async (data, signal) => {
  try {
    console.log(data)
    const response = await apiClient.post(`/food-instance/duplicate`, data, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (duplicateFoodInstanceApi).");
      return null;
    }
    console.error(`Error in duplicateFoodInstanceApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};

//smaze jednu nebo vice instanci
export const deleteFoodInstanceApi = async (data, signal) => {
  try {
    const response = await apiClient.delete(`/food-instance/`, { data, signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (deleteFoodInstanceApi).");
      return null;
    }
    console.error(`Error in deleteFoodInstanceApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};



