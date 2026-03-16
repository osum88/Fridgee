import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInventoryApi, updateInventoryApi } from "@/api/inventory";

// vytvori inventar
export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  const createInventory = useMutation({
    mutationFn: (data) => {
      return createInventoryApi(data);
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

// updatuje inventory
export const useUpdateInventory = (inventoryId) => {
  const updateInventory = useMutation({
    mutationFn: (data) => updateInventoryApi(inventoryId, data),
  });
  return { updateInventory, isSubmitting: updateInventory.isPending };
};
