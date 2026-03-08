import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFoodToInventoryApi } from "@/api/food";

const useAddFoodMutation = (inventoryId) => {
  const queryClient = useQueryClient();

  const addFood = useMutation({
    mutationFn: ({ foodData, imageFormData }) => addFoodToInventoryApi(foodData, imageFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-content", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["food-detail", parseInt(inventoryId)] });
      console.log("Food added successfully");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error adding food:", errorMessage);
    },
  });
  return { addFood, isSubmitting: addFood.isPending };
};

export default useAddFoodMutation;
