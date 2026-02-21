import { updateUserProfileImageApi } from "@/api/user";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { moveFile } from "@/utils/imageDownload";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUpdateUserProfileImageMutation = ({ setImage }) => {
  const queryClient = useQueryClient();

  const updateUserProfileImageMutation = useMutation({
    mutationFn: (userData) => {
      return updateUserProfileImageApi(userData.formData);
    },
    onSuccess: async (response, variables) => {
      //aktulizuje fotku v cache quary
      const profilePictureUrl = response?.data?.profilePictureUrl;
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

      await AsyncStorage.setItem(
        "PROFILE_IMAGE_UPDATE",
        profilePictureUrl
      );
      

      moveFile(variables.uploadUri, "profile", `profile_${userId}.webp`, true);
      console.log("Profile Image upload succesffuly");
    },
    onError: (error) => {
      setImage(null);
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error updateUserProfileImageMutation", errorMessage);
    },
  });
  return {
    updateUserProfileImageMutation,
  };
};

export default useUpdateUserProfileImageMutation;
