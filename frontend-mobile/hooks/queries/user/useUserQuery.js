import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserByIdApi, searchUsersApi, updatePreferredLanguageApi } from "@/api/user";

export const useGetUserQuery = (userId, enabled) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdApi(userId),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 60,    //hodina
  });
};

export const useUpdatePreferredLanguageMutation = () => {
  return useMutation({
    mutationFn: updatePreferredLanguageApi,
    onError: (error) => {
      console.error("Error updating language user: ", error)
    },
  });
};

export const useSearchUsersQuery = (username, limit) => {
  return useQuery({
    queryKey: ["searchUsername", username, limit],
    queryFn: () => searchUsersApi(username, limit),
    enabled: !!username,
    staleTime: 1000 * 60 * 2,
  });
};