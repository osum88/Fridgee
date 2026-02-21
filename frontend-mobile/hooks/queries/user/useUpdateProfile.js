import { updateProfileApi } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: updateProfileApi,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      console.log("Update profile info succesffuly");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error updating profile info:", errorMessage);
    },
  });

  return { updateProfile, isSubmitting: updateProfile.isPending };
};

export default useUpdateProfile;
