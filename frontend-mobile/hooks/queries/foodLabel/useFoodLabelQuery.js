import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { getAvailableFoodLabelsApi, getFoodLabelApi } from "@/api/foodLabel";

const ONE_MIN = 60 * 1000;
const TWO_MIN = 1000 * 60 * 2;
const ONE_HOUR = 1000 * 60 * 60;

// vrati vsechny labely uzivatele i ty co jsou v inventari
export const useGetAvailableFoodLabels = (
  source,
  searchString = "",
  limit = 50,
  enabled = true,
) => {
  const isFocused = useIsFocused();

  return useInfiniteQuery({
    queryKey: ["available-food-labels", source, searchString, limit],
    queryFn: ({ signal, pageParam = 1 }) => {
      const searchData = searchString ? { searchString } : {};
      return getAvailableFoodLabelsApi({ source, ...searchData, limit, page: pageParam }, signal);
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.data?.hasNextPage ? lastPage.data.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: !!enabled && !!source && !!isFocused,
    staleTime: ONE_MIN,
    gcTime: ONE_HOUR,
    refetchInterval: () => {
      return isFocused ? TWO_MIN : false;
    },
    select: (data) => data.pages.flatMap((page) => page?.data?.items ?? []),
  });
};

export const useGetFoodLabel = (foodLabelId, enabled = true) => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["food-label", parseInt(foodLabelId)],
    queryFn: ({ signal }) => getFoodLabelApi(foodLabelId, signal),
    enabled: !!enabled && !!foodLabelId,
    staleTime: ONE_MIN,
    gcTime: ONE_HOUR,
    select: (data) => data?.data ?? null,
    initialData: () => {
      const allLabelsQueries = queryClient.getQueriesData({
        queryKey: ["available-food-labels"],
      });
      const item = allLabelsQueries
        .flatMap(([, data]) => data?.pages ?? [])
        .flatMap((page) => page?.data?.items ?? [])
        .find((l) => l.id === parseInt(foodLabelId));
      return item ? { data: item } : undefined;
    },
  });
};
