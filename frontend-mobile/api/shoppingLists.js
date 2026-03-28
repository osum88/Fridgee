import apiClient from "@/utils/api-client";
import { isCancel } from "axios";

// vraci obsah nakupnich seznamu
export const getShoppingListsContentApi = async (inventoryId, signal) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/shopping-lists`, { signal });
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getShoppingListsContentApi).");
      return null;
    }
    console.error(
      `Error in getShoppingListsContentApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// vytvori nakupni seznam
export const createShoppingListApi = async (inventoryId, data) => {
  try {
    const response = await apiClient.post(`/inventory/${inventoryId}/shopping-lists`, data);
    return response.data;
  } catch (error) {
    console.error(
      `Error in createShoppingListApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// updatuje nakupni seznam
export const updateShoppingListApi = async (inventoryId, shoppingListId, data) => {
  try {
    const response = await apiClient.patch(
      `/inventory/${inventoryId}/shopping-lists/${shoppingListId}`,
      data,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in updateShoppingListApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//smaze nakupni seznam
export const deleteShoppingListApi = async (inventoryId, shoppingListId) => {
  try {
    const response = await apiClient.delete(
      `/inventory/${inventoryId}/shopping-lists/${shoppingListId}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in deleteShoppingListApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vraci vsechny seznamy nakupu
export const getShoppingListsLightApi = async (inventoryId, signal) => {
  try {
    const response = await apiClient.get(
      `/inventory/${inventoryId}/shopping-lists/list`,
      { signal },
    );
    return response.data;
  } catch (error) {
    if (isCancel(error)) {
      console.log("The request has been securely cancelled (getShoppingListsLightApi).");
      return null;
    }
    console.error(
      `Error in getShoppingListsLightApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
