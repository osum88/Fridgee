import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateFoodInstanceApi,
  consumeFoodInstanceApi,
  deleteFoodInstanceApi,
  duplicateFoodInstanceApi,
  addFoodInstanceApi,
} from "@/api/instance";

//updatuje food instance
export const useUpdateFoodInstanceMutation = (inventoryId, catalogId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => updateFoodInstanceApi(data),
    onSuccess: async () => {
      console.log("updateFoodInstanceMutation update succes");
      queryClient.invalidateQueries({
        queryKey: ["food-variants", parseInt(inventoryId), parseInt(catalogId)],
      });
      queryClient.resetQueries({ queryKey: ["inventory-history", parseInt(inventoryId)] });
    },
    onError: (error) => {
      console.error("updateFoodInstanceMutation error:", error);
    },
  });
  return {
    updateInstance: mutation,
    isSubmitting: mutation.isPending,
  };
};

const invalidateAfterMutation = (queryClient, inventoryId, catalogId, foodId) => {
  queryClient.invalidateQueries({
    queryKey: ["inventory-content", parseInt(inventoryId)],
  });
  queryClient.refetchQueries({
    queryKey: ["food-detail", parseInt(inventoryId), parseInt(catalogId), parseInt(foodId)],
  });
  queryClient.resetQueries({
    queryKey: ["inventory-history", parseInt(inventoryId)],
  });
};

// zkonzumuje foodinstance pokud je spotrebovana nebo upravi amount pokud je jen castecna konzumace
export const useConsumeFoodInstanceMutation = (inventoryId, catalogId, foodId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => consumeFoodInstanceApi(data),
    onSuccess: () => {
      invalidateAfterMutation(queryClient, inventoryId, catalogId, foodId);
      console.log("useConsumeFoodInstanceMutation consume succes");
    },
    onError: (error) => {
      console.error("consumeFoodInstanceMutation error:", error);
    },
  });
  return { consumeInstance: mutation, isSubmitting: mutation.isPending };
};

//duplikuje instance food
export const useDuplicateFoodInstanceMutation = (inventoryId, catalogId, foodId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => duplicateFoodInstanceApi(data),
    onSuccess: () => {
      invalidateAfterMutation(queryClient, inventoryId, catalogId, foodId);
      console.log("useDuplicateFoodInstanceMutation duplicate succes");
    },
    onError: (error) => {
      console.error("duplicateFoodInstanceMutation error:", error);
    },
  });
  return { duplicateInstance: mutation, isSubmitting: mutation.isPending };
};

//smaze jednu nebo vice instanci
export const useDeleteFoodInstanceMutation = (inventoryId, catalogId, foodId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => deleteFoodInstanceApi(data),
    onSuccess: () => {
      invalidateAfterMutation(queryClient, inventoryId, catalogId, foodId);
      console.log("useDeleteFoodInstanceMutation delete succes");
    },
    onError: (error) => {
      console.error("deleteFoodInstanceMutation error:", error);
    },
  });
  return { deleteInstance: mutation, isSubmitting: mutation.isPending };
};

//prida instance
export const useAddFoodInstanceMutation = (inventoryId) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => addFoodInstanceApi(data),
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["inventory-history", parseInt(inventoryId)] });
      console.log("useAddFoodInstanceMutation add succes");
    },
    onError: (error) => {
      console.error("addFoodInstanceMutation error:", error);
    },
  });
  return { addInstance: mutation, isSubmitting: mutation.isPending };
};
