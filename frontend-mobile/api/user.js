import apiClient from "@/utils/api-client";

export const getUserByIdApi = async (userData) => {
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.log("Error fetching user by Id: ", error);
    throw error;
  }
};

export const updatePreferredLanguageApi = async (userData) => {
  try {
    const response = await apiClient.patch("/users/language", userData);
    return response.data;
  } catch (error) {
    console.log("Error updating language user by Id: ", error);
    throw error;
  }
};

export const searchUsersApi = async (username, limit = 8) => {
  try {
    const response = await apiClient.get(`/users/search?username=${username}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.log("Error searching users by username: ", error);
    throw error;
  }
};
