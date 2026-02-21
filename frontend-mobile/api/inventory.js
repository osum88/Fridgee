import apiClient from "@/utils/api-client";

//hleda jidlo podle stringu
export const getInventorySuggestionsApi = async (inventoryId, title, limit = 6) => {
  try {
    const response = await apiClient.get(
      `/inventory/${inventoryId}/suggestions?title=${title}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error in getInventorySuggestionsApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

// vrati vsechny jidla s kategoriemi, intancemi a labely
export const getInventoryFoodCategoriesApi = async (inventoryId) => {
  try {
    const response = await apiClient.get(`/inventory/${inventoryId}/food-category`);
    return response.data;
  } catch (error) {
    console.error(
      `Error in getInventoryFoodCategoriesApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
