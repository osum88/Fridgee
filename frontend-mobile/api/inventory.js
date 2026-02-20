import apiClient from "@/utils/api-client";

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
