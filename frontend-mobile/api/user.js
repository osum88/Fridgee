import apiClient from "@/utils/api-client";

//vrati uzivatele podle id
export const getUserByIdApi = async (userData) => {
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error in getUserByIdApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje jazyk
export const updatePreferredLanguageApi = async (userData) => {
  try {
    const response = await apiClient.patch("/users/language", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error in updatePreferredLanguageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//vyhleda uzivatele podle username
export const searchUsersApi = async (username, limit = 8) => {
  try {
    const response = await apiClient.get(
      `/users/search?username=${username}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error in searchUsersApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje profile image
export const updateUserProfileImageApi = async (file) => {
  try {
    const response = await apiClient.patch("/users/profile-image", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error in uploadProfileImageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje profile image
export const deleteUserProfileImageApi = async () => {
  try {
    const response = await apiClient.delete("/users/profile-image");
    return response.data;
  } catch (error) {
    console.error(
      "Error in deleteUserProfileImageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};
