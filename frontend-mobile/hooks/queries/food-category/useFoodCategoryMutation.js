import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  deleteFoodCategoryApi,
  updateFoodCategoryApi,
  createFoodCategoryApi,
} from "@/api/category";

//updatuje kategorii
export const useUpdateFoodCategory = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ categoryId, title }) => updateFoodCategoryApi(categoryId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-categories", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["inventory-content", parseInt(inventoryId)] });
    },
  });
};

//smaze kategorii
export const useDeleteFoodCategory = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId) => deleteFoodCategoryApi(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-categories", parseInt(inventoryId)] });
      queryClient.invalidateQueries({ queryKey: ["inventory-content", parseInt(inventoryId)] });
    },
  });
};

//prida kategorii
export const useCreateFoodCategory = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title) => createFoodCategoryApi(inventoryId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["food-categories", parseInt(inventoryId)] });
    },
  });
};
