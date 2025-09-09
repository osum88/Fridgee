import apiClient from "@/utils/api-client";

export const getUserByIdApi = async (userData) => {
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.error("Error in getUserByIdApi: ", error, "->", error.response?.data?.message || error.message);
    throw error;
  }
};

export const updatePreferredLanguageApi = async (userData) => {
  try {
    const response = await apiClient.patch("/users/language", userData);
    return response.data;
  } catch (error) {
    console.error("Error in updatePreferredLanguageApi: ", error);
    throw error;
  }
};

export const searchUsersApi = async (username, limit = 8) => {
  try {
    const response = await apiClient.get(`/users/search?username=${username}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Error in searchUsersApi: ", error);
    throw error;
  }
};
