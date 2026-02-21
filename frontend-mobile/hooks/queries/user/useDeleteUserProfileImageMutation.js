import { deleteUserProfileImageApi } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useDeleteUserProfileImageMutation = ({ setImage }) => {
  const queryClient = useQueryClient();

  const deleteUserProfileImageMutation = useMutation({
    mutationFn: deleteUserProfileImageApi,
    onSuccess: async (response) => {
      //aktulizuje fotku v cache quary
      const profilePictureUrl = "none";
      const userId = response?.data?.id;
      queryClient.setQueryData(["user", userId], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          data: {
            ...oldData.data,
            profilePictureUrl,
          },
        };
      });
      await AsyncStorage.removeItem("PROFILE_IMAGE_UPDATE");
      console.log("Profile Image delete succesffuly");
    },
    onError: (error) => {
      setImage(null);
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error deleteUserProfileImageMutation", errorMessage);
    },
  });
  return {
    deleteUserProfileImageMutation,
  };
};

export default useDeleteUserProfileImageMutation;
