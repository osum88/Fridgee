import apiClient from "@/utils/api-client";

// prida food do invenatre, pripadne vytvori label,catalog, history, variant
export const addFoodToInventoryApi = async (foodData, imageFormData = null) => {
  try {
    const finalFormData = new FormData();

    // prekopiruje soubor z puvodnich formadata pokud existuje
    if (imageFormData && imageFormData._parts) {
      const filePart = imageFormData._parts.find((part) => part[0] === "file");
      if (filePart) {
        finalFormData.append("file", filePart[1]);
      }
    }

    Object.keys(foodData).forEach((key) => {
      const value = foodData[key];
      if (value !== undefined) {
        let formattedValue;
        if (value instanceof Date) {
          formattedValue = value.toISOString();
        } else if (value === null || value === "null" || value === "") {
          formattedValue = "";
        } else {
          formattedValue = value.toString();
        }
        finalFormData.append(key, formattedValue);
      }
    });

    console.log(finalFormData);
    const response = await apiClient.post("/food", finalFormData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error in addFoodToInventoryApi: ${error} -> ${error.response?.data?.message || error.message}`,
    );
    throw error;
  }
};
