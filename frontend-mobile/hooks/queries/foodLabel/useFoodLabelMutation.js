import { useMutation } from "@tanstack/react-query";
import { deleteFoodLabelApi, updateFoodLabelApi } from "@/api/foodLabel";

// smaze label
export const useDeleteFoodLabel = () => {
  return useMutation({
    mutationFn: ({ foodLabelId }) => deleteFoodLabelApi(foodLabelId),
  });
};

// updatuje label
export const useUpdateFoodLabelMutation = () => {
  return useMutation({
    mutationFn: ({ foodLabelData, imageFormData }) =>
      updateFoodLabelApi(foodLabelData, imageFormData),
    onSuccess: () => {
      console.log("Food label updated successfully");
    },
  });
};
