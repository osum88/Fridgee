import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserByIdApi, updatePreferredLanguageApi } from "@/api/user";

export const useGetUserQuery = (userId, enabled) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdApi(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdatePreferredLanguageMutation = () => {
  return useMutation({
    mutationFn: updatePreferredLanguageApi,
    onError: (error) => {
      console.log("Error updating language user: ", error)
    },
  });
};
