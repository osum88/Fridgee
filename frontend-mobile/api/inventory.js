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
export const createInventoryApi = async (data) => {
  try {
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
    console.log("1");
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

//vraci historii
export const getInventoryHistoryApi = async (inventoryId, filters = {}, signal) => {
  try {
    const { limit = 20, cursor, type, fromDate, toDate, search, changedBy } = filters;

    const params = { limit };
    if (cursor) params.cursor = cursor;
    if (type?.length) params.type = type;
    if (fromDate) params.fromDate = new Date(fromDate).toISOString();
    if (toDate) params.toDate = new Date(toDate).toISOString();
    if (search) params.search = search;
    if (changedBy?.length) params.changedBy = changedBy;

    const response = await apiClient.get(`/inventory/${inventoryId}/history`, {
      params,
      signal,
      paramsSerializer: (params) => {
        return Object.entries(params)
          .flatMap(([key, value]) =>
            Array.isArray(value)
              ? value.map((v) => `${key}=${encodeURIComponent(v)}`)
              : [`${key}=${encodeURIComponent(value)}`],
          )
          .join("&");
      },
    });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getInventoryHistoryApi).");
      return null;
    }
    console.error(
      `Error in getInventoryHistoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vrati vsechny usery inventare
export const getUsersByInventoryIdApi = async (inventoryId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/users/all`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (getUsersByInventoryIdApi).");
      return null;
    }
    console.error(
      `Error in getUsersByInventoryIdApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//updatuje api
export const updateInventoryApi = async (inventoryId, data) => {
  try {
    console.log("ad",data)
    const response = await apiClient.patch(`/inventory/${inventoryId}`, data);
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("Request cancelled (updateFoodInventoryApi).");
      return null;
    }
    console.error(
      `Error in updateFoodInventoryApi: ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
