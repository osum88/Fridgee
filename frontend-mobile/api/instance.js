import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

//updatuje insatnce
export const updateFoodInstanceApi = async (data) => {
  try {
    const response = await apiClient.patch(`/food-instance/`, data);
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
export const consumeFoodInstanceApi = async (data) => {
  try {
    const response = await apiClient.patch(`/food-instance/consume`, data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (consumeFoodInstanceApi).");
      return null;
    }
    console.error(
      `Error in consumeFoodInstanceApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//duplikuje instance food
export const duplicateFoodInstanceApi = async (data) => {
  try {
    const response = await apiClient.post(`/food-instance/duplicate`, data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (duplicateFoodInstanceApi).");
      return null;
    }
    console.error(
      `Error in duplicateFoodInstanceApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//smaze jednu nebo vice instanci
export const deleteFoodInstanceApi = async (data) => {
  try {
    const response = await apiClient.delete(`/food-instance/`, { data });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (deleteFoodInstanceApi).");
      return null;
    }
    console.error(
      `Error in deleteFoodInstanceApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

export const addFoodInstanceApi = async (data) => {
  try {
    const response = await apiClient.post(`/food-instance/`, data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (addFoodInstanceApi).");
      return null;
    }
    console.error(`Error in addFoodInstanceApi: ${error.response?.data?.message || error.message}`);
    throw error;
  }
};
