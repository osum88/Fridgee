import i18n from "@/constants/translations";
import apiClient from "@/utils/api-client";


//vrati uzivatele podle id
export const getUserByIdApi = async (userData) => {
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.error(
      `Error in getUserByIdApi: ${error} -> ${error.response?.data?.message || error.message}`,
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
      `Error in updatePreferredLanguageApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vyhleda uzivatele podle username
export const searchUsersApi = async (username, limit = 8) => {
  try {
    const response = await apiClient.get(`/users/search?username=${username}&limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error in searchUsersApi: ${error} -> ${error.response?.data?.message || error.message}`,
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
      `Error in uploadProfileImageApi: ${error} -> ${error.response?.data?.message || error.message}`,
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
      `Error in deleteUserProfileImageApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};

//vrati bankovni cislo po zadani hesla
export const getBankNumberPasswordApi = async (data) => {
  try {
    const response = await apiClient.post("/users/bank-number", data);
    return response.data;
  } catch (error) {
    console.error(
      `Error in getBankNumberPassword: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    if (error.response) {
      const { status } = error.response?.data || {};

      if (status === 400) {
        throw new Error(i18n.t("errorPassword"));
      } else if (status === 429) {
        throw new Error(i18n.t("errorTooManyRequest"));
      } else {
        throw new Error(i18n.t("errorDefault"));
      }
    } else if (error.request) {
      throw new Error(i18n.t("errorNetwork"));
    } else {
      throw new Error(i18n.t("errorDefault"));
    }
  }
};

//updatuje profil info usera
export const updateProfileApi = async (data) => {
  try {
    const response = await apiClient.patch("/users", data);
    return response.data;
  } catch (error) {
    console.error(
      `Error in updateProfileApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
