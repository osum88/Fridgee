import apiClient from "@/utils/api-client";

export const getUserByIdApi = async (userData) => {
  console.log("-------------------------------                 ---------------------------------------------------------")
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.log(new Date().toISOString(), "Error fetching user by Id: ", error);
    throw error;
  }
};

