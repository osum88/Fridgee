import apiClient from "@/utils/api-client";

// export const addFoodToInventoryApi = async (foodData, imageResult = null) => {
//   try {
//     // 1. Vždy vytvoříme nový FormData
//     const formData = imageResult?.formData || new FormData();

//     // 2. Přidáme všechna metadata z formuláře
//     Object.keys(foodData).forEach((key) => {
//       const value = foodData[key];
//       if (value !== undefined && value !== null && value !== "") {
//         formData.append(key, value.toString());
//       }
//     });

//     // 3. Odeslání - Axios automaticky nastaví správné boundary pro multipart
//     const response = await apiClient.post("/food", formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     });

//     return response.data;
//   } catch (error) {
//     console.error(`Error in addFoodToInventoryApi: ${error.message}`);
//     throw error;
//   }
// };

// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { addFoodToInventoryApi } from "@/api/inventoryApi";

// export const useAddFoodMutation = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: ({ foodData, imageResult }) => addFoodToInventoryApi(foodData, imageResult),
//     onSuccess: (data, variables) => {
//       // Refreshneme seznam jídla pro daný inventář
//       queryClient.invalidateQueries({
//         queryKey: ["inventory-food", variables.foodData.inventoryId],
//       });
//       console.log("Jídlo úspěšně přidáno");
//     },
//     onError: (error) => {
//       console.error("Chyba při přidávání jídla:", error);
//     },
//   });
// };