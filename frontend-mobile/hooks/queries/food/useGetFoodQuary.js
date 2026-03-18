import { getInventorySuggestionsApi } from "@/api/inventory";
import { getFoodByBarcodeApi } from "@/api/catalog";
import { getFoodDetailApi, getFoodVariantsApi } from "@/api/food";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useEffect } from "react";

const TEN_SEC = 1000 * 60 * 10;
const TWENTY_SEC = 20 * 1000;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

//hleda jidlo podle stringu
export const useGetLabelSuggestionsQuary = (labelTitle, inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["labelSuggestions", labelTitle, parseInt(inventoryId)],
    queryFn: ({ signal }) => getInventorySuggestionsApi(inventoryId, labelTitle, 6, signal),
    enabled: !!enabled && !!labelTitle && !!inventoryId,
    staleTime: TWENTY_SEC,
    placeholderData: (previousData) => previousData,
  });
};

//hleda jidlo podle barcodu
export const useGetFoodByBarcodeQuary = (barcode, inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["barcode-food", barcode, parseInt(inventoryId)],
    queryFn: ({ signal }) => getFoodByBarcodeApi(barcode, inventoryId, signal),
    enabled: !!enabled && !!barcode && !!inventoryId,
  });
};

//ziska detail food
export const useFoodDetail = (inventoryId, catalogId, foodId, memberCount = 1, enabled = true) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const query = useQuery({
    queryKey: ["food-detail", parseInt(inventoryId), parseInt(catalogId), parseInt(foodId)],
    queryFn: ({ signal }) => getFoodDetailApi(inventoryId, foodId, signal),
    enabled: !!foodId && !!enabled,
    staleTime: () => (memberCount > 1 ? TWENTY_SEC : ONE_WEEK),
    gcTime: ONE_HOUR,
    select: (data) => data?.data ?? data,
    retry: (failureCount, error) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 3;
    },
    initialData: () => {
      const allInventories = queryClient.getQueriesData({
        queryKey: ["inventory-content", parseInt(inventoryId)],
      });
      for (const [, cached] of allInventories) {
        const categories = cached?.data ?? cached;
        if (!Array.isArray(categories)) continue;
        for (const category of categories) {
          const found = category.foods?.find((f) => f.foodId === parseInt(foodId));
          if (found)
            return { data: { ...found, categoryId: category.categoryId || "no-category" } };
        }
      }
      return undefined;
    },
    initialDataUpdatedAt: () => {
      const queries = queryClient.getQueriesData({
        queryKey: ["inventory-content", parseInt(inventoryId)],
      });
      if (!queries.length) return 0;
      const state = queryClient.getQueryState(queries[0][0]);
      return state?.dataUpdatedAt ?? 0;
    },
  });
  useEffect(() => {
    if (query.error?.response?.status === 404) {
      router.replace("/(protected)/(menu)/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.error]);

  return query;
};

//vrati vsechny varianty v invenatri pro dane food
export const useGetFoodVariants = (inventoryId, catalogId, enabled = true) => {
  return useQuery({
    queryKey: ["food-variants", parseInt(inventoryId), parseInt(catalogId)],
    queryFn: ({ signal }) => getFoodVariantsApi(inventoryId, catalogId, signal),
    enabled: !!inventoryId && !!catalogId && !!enabled,
    staleTime: TEN_SEC,
    gcTime: ONE_HOUR,
    select: (data) => data?.data,
  });
};
