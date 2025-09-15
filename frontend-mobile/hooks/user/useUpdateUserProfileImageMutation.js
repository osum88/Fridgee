import { updateUserProfileImageApi } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateUserProfileImageMutation = () => {
  const queryClient = useQueryClient();

  const updateUserProfileImageMutation = useMutation({
    mutationFn: updateUserProfileImageApi,
    onSuccess: async (response) => {
      //   await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {},
  });
  return {
    updateUserProfileImageMutation,
    isLoading: updateUserProfileImageMutation.isPending,
  };
};

export default useUpdateUserProfileImageMutation;
