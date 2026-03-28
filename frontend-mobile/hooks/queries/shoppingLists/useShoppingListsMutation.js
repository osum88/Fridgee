import { useMutation, useQueryClient } from "@tanstack/react-query";
import { showGlobalError } from "@/utils/showGlobalError";
import {
  createShoppingListApi,
  updateShoppingListApi,
  deleteShoppingListApi,
} from "@/api/shoppingLists";

// vytvori nakupni seznam
export const useCreateShoppingList = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }) => createShoppingListApi(inventoryId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists-only", parseInt(inventoryId)] });
    },
  });
};

// updatuje nakupni seznam
export const useUpdateShoppingList = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shoppingListId, data }) =>
      updateShoppingListApi(inventoryId, shoppingListId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists-only", parseInt(inventoryId)] });
    },
  });
};

//smaze nakupni seznam
export const useDeleteShoppingList = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ shoppingListId }) => deleteShoppingListApi(inventoryId, shoppingListId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-lists", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["shopping-lists-only", parseInt(inventoryId)] });
    },
    onError: (error) => {
      showGlobalError(error);
    },
  });
};
