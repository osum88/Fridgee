import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

//hleda jidlo podle stringu
export const getInventorySuggestionsApi = async (inventoryId, title, limit = 6, signal) => {
  try {
    const response = await apiClient.get(
      `/inventory/${inventoryId}/suggestions?title=${title}&limit=${limit}`,
      { signal },
    );
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getInventorySuggestionsApi).");
      return null;
    }
    console.error(
      `Error in getInventorySuggestionsApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// vrati vsechny jidla s kategoriemi, intancemi a labely
export const getInventoryFoodCategoriesApi = async (inventoryId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/food-category`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getInventoryFoodCategoriesApi).");
      return null;
    }
    console.error(
      `Error in getInventoryFoodCategoriesApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// vrati vsechny inventare ke kterym na user pristup
export const getAllFoodInventoriesApi = async (signal) => {
  try {
    const response = await apiClient.get("/inventory", { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getAllFoodInventoriesApi).");
      return null;
    }
    console.error(
      `Error in getAllFoodInventoriesApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// ziska konkretni inventar
export const getInventoryDetailsApi = async (inventoryId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}`, { signal });
    console.log(response.data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getInventoryDetailsApi).");
      return null;
    }
    console.error(
      `Error in getInventoryDetailsApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// vytvori inventar
export const createFoodInventoryApi = async (data) => {
  try {
    console.log("Polo", data);
    const response = await apiClient.post("/inventory", data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (createFoodInventoryApi).");
      return null;
    }
    console.error(
      `Error in createFoodInventoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// ziska obsah konkretniho inventare
export const getInventoryContentApi = async (inventoryId, signal) => {
  try {
    console.log("1")
    const response = await apiClient.get(`/inventory/${inventoryId}/content`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getInventoryContentApi).");
      return null;
    }
    console.error(
      `Error in getInventoryContentApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
