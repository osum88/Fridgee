import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFoodInventoryApi } from "@/api/inventory";

// vytvori inventar
const useCreateInventory = () => {
  const queryClient = useQueryClient();

  const createInventory = useMutation({
    mutationFn: (data) => {
      return createFoodInventoryApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error adding inventory:", errorMessage);
    },
  });
  return { createInventory, isSubmitting: createInventory.isPending };
};

export default useCreateInventory;
