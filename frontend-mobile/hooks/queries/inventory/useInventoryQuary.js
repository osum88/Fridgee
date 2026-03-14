import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryFoodCategoriesApi,
  getInventoryDetailsApi,
  getAllFoodInventoriesApi,
  getInventoryContentApi,
  getInventoryHistoryApi,
  getUsersByInventoryIdApi,
} from "@/api/inventory";
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import { INVENTORY_THEMES } from "@/constants/colors";

const TWENTY_SEC = 1000 * 20;
const THIRTY_SEC = 1000 * 30;
const ONE_MIN = 60 * 1000;
const TWO_MIN = 1000 * 60 * 2;
const FIVE_MIN = 5 * 60 * 1000;
const TWENTY_MIN = 1000 * 60 * 20;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// vrati vsechny kategorie z inventare
export const useGetInventoryCategoriesQuery = (inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["food-categories", parseInt(inventoryId)],
    queryFn: ({ signal }) => getInventoryFoodCategoriesApi(inventoryId, signal),
    enabled: enabled && !!inventoryId,
    staleTime: ONE_HOUR,
  });
};

//vrati vsechny inventare
export const useFoodInventories = (enabled = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventories"],
    queryFn: ({ signal }) => getAllFoodInventoriesApi(signal),
    staleTime: FIVE_MIN,
    enabled: enabled,
    select: (res) => {
      return res.data.map((item) => ({
        ...item,
        themeColors: INVENTORY_THEMES[item.icon] || { light: "#555", dark: "#fff" },
      }));
    },
  });

  //nahraje data pro jednotliva inventory IDs do cache
  useEffect(() => {
    if (query.data && query.isSuccess) {
      query.data.forEach((inventory) => {
        queryClient.setQueryData(["food-inventory", parseInt(inventory.id)], {
          data: inventory,
          message: "Pre-seeded from list",
          status: 200,
        });
      });
    }
  }, [query.data, query.isSuccess, queryClient]);
  return query;
};

//vrati informace o inventari
export const useInventoryDetail = (inventoryId, enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["food-inventory", parseInt(inventoryId)],
    queryFn: ({ signal }) => getInventoryDetailsApi(inventoryId, signal),
    enabled: !!inventoryId && isFocused && enabled,
    //pokud inventory ma vic jak 1 membera pak cache je validovana
    staleTime: (query) => {
      return query.state.data?.memberCount > 1 ? TWO_MIN : FIVE_MIN;
    },
    refetchOnReconnect: "always",
    refetchInterval: (query) => {
      return query.state.data?.memberCount > 1 ? TWO_MIN : false;
    },
  });
};

//vrati content inventare
export const useInventoryContent = (inventoryId, memberCount = 1, enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["inventory-content", parseInt(inventoryId)],
    queryFn: ({ signal }) => getInventoryContentApi(inventoryId, signal),
    enabled: !!inventoryId && isFocused && enabled,
    staleTime: () => {
      return memberCount > 1 ? THIRTY_SEC : ONE_WEEK;
    },
    gcTime: ONE_HOUR,
    refetchOnReconnect: "always",
    refetchInterval: () => {
      const isShared = (memberCount ?? 0) > 1;
      return isShared && isFocused ? ONE_MIN : false;
    },
    select: (data) => {
      if (!data) return [];
      return data?.data;
    },
    notifyOnChangeProps: ["data", "status", "error"],
  });
};

//vraci hisotrii
export const useInventoryHistory = (inventoryId, filters = {}, memberCount = 1, enabled = true) => {
  const isFocused = useIsFocused();

  return useInfiniteQuery({
    queryKey: ["inventory-history", parseInt(inventoryId), filters],
    queryFn: ({ pageParam, signal }) =>
      getInventoryHistoryApi(inventoryId, { ...filters, limit: 40, cursor: pageParam }, signal),
    getNextPageParam: (lastPage) => lastPage?.data?.nextCursor ?? undefined,
    staleTime: () => {
      return memberCount > 1 ? THIRTY_SEC : ONE_WEEK;
    },
    initialPageParam: undefined,
    gcTime: TWENTY_MIN,
    refetchOnReconnect: "always",
    refetchInterval: () => {
      const isShared = (memberCount ?? 0) > 1;
      return isShared && isFocused ? ONE_MIN : false;
    },
    enabled: !!inventoryId && isFocused && enabled,
    placeholderData: (previousData) => previousData,
  });
};

//vrati vsechny usery inventare
export const useGetUsersByInventoryId = (inventoryId, memberCount = 1, enabled = true) => {
  return useQuery({
    queryKey: ["inventorysignal-users", inventoryId],
    queryFn: ({ signal }) => getUsersByInventoryIdApi(inventoryId, signal),
    enabled: !!inventoryId && enabled,
    staleTime: () => {
      return memberCount > 1 ? TWENTY_SEC : ONE_WEEK;
    },
    select: (data) => {
      if (!data) return [];
      return data?.data;
    },
  });
};
