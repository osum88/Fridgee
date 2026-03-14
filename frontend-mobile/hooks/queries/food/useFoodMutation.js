import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFoodToInventoryApi, updateFoodApi } from "@/api/food";

export const useAddFoodMutation = (inventoryId) => {
  const queryClient = useQueryClient();

  const addFood = useMutation({
    mutationFn: ({ foodData, imageFormData }) => addFoodToInventoryApi(foodData, imageFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-content", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["food-detail", parseInt(inventoryId)] });
      queryClient.resetQueries({ queryKey: ["inventory-history", parseInt(inventoryId)] });
      console.log("Food added successfully");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error adding food:", errorMessage);
    },
  });
  return { addFood, isSubmitting: addFood.isPending };
};

export const useUpdateFoodMutation = (inventoryId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ foodData, imageFormData }) => updateFoodApi(foodData, imageFormData),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["inventory-history", parseInt(inventoryId)] });

      console.log("Food added successfully");
    },
    onError: (error) => {
      console.error("useUpdateFoodMutation error:", error);
    },
  });

  return { updateFood: mutation, isSubmitting: mutation.isPending };
};
