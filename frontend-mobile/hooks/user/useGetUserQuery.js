import { useQuery } from "@tanstack/react-query";
import { getUserByIdApi } from "@/api/user";

export const useGetUserQuery = (userId) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserByIdApi(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
    // retry: false
  });
};