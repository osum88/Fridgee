import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryFoodCategoriesApi,
  getInventoryDetailsApi,
  getAllFoodInventoriesApi,
  getInventoryContentApi,
  getInventoryHistoryApi,
  getUsersByInventoryIdApi,
  searchUsersForInventoryApi,
  getInventoryInvitationsByUserApi,
  getFoodInstanceByBarcodeApi,
} from "@/api/inventory";
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import { INVENTORY_THEMES } from "@/constants/colors";

const TEN_SEC = 1000 * 10;
const TWENTY_SEC = 1000 * 20;
const THIRTY_SEC = 1000 * 30;
const ONE_MIN = 60 * 1000;
const TWO_MIN = 1000 * 60 * 2;
const FIVE_MIN = 5 * 60 * 1000;
const TWENTY_MIN = 1000 * 60 * 20;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

// vrati vsechny kategorie z inventare
export const useGetInventoryCategoriesQuery = (inventoryId, memberCount = 1, enabled = true) => {
  return useQuery({
    queryKey: ["food-categories", parseInt(inventoryId)],
    queryFn: ({ signal }) => getInventoryFoodCategoriesApi(inventoryId, signal),
    enabled: !!enabled && !!inventoryId,
    staleTime: () => {
      return memberCount > 1 ? ONE_MIN : ONE_HOUR;
    },
  });
};

//vrati vsechny inventare
export const useFoodInventories = (enabled = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventories"],
    queryFn: ({ signal }) => getAllFoodInventoriesApi(signal),
    staleTime: TWO_MIN,
    enabled: !!enabled,
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
    enabled: !!inventoryId && isFocused && !!enabled,
    staleTime: (query) => {
      return query.state.data?.memberCount > 1 ? ONE_MIN : FIVE_MIN;
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
    enabled: !!inventoryId && isFocused && !!enabled,
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

//vraci historii
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
    enabled: !!inventoryId && isFocused && !!enabled,
    placeholderData: (previousData) => previousData,
  });
};

//vrati vsechny usery inventare
export const useGetUsersByInventoryId = (
  inventoryId,
  memberCount = 1,
  sortBy = "resultName",
  enabled = true,
) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: [`inventory-users-${sortBy}`, inventoryId],
    queryFn: ({ signal }) => getUsersByInventoryIdApi(inventoryId, signal, sortBy),
    enabled: !!inventoryId && !!enabled,
    staleTime: () => {
      return memberCount > 1 ? TWENTY_SEC : ONE_WEEK;
    },
    refetchInterval: () => {
      const isShared = (memberCount ?? 0) > 1;
      return isShared && isFocused ? ONE_MIN : false;
    },
    select: (data) => {
      if (!data) return [];
      return data?.data;
    },
  });
};

//vyhleda usery pro pridani do inventare
export const useSearchUsersForInventory = (inventoryId, username, limit = 10, enabled = true) => {
  return useQuery({
    queryKey: ["inventory-search-users", inventoryId, username, limit],
    queryFn: ({ signal }) => searchUsersForInventoryApi(inventoryId, username, limit, signal),
    enabled: !!inventoryId && !!username?.trim() && !!enabled,
    staleTime: TEN_SEC,
    gcTime: TWENTY_MIN,
    select: (data) => {
      if (!data) return [];
      return data?.data;
    },
  });
};

//vrati vsechny pozvanky pro usera
export const useGetInventoryInvitations = (enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["inventory-invitations"],
    queryFn: ({ signal }) => getInventoryInvitationsByUserApi(signal),
    enabled: !!enabled,
    staleTime: THIRTY_SEC,
    refetchInterval: () => {
      return isFocused ? ONE_MIN : false;
    },
    select: (data) => data?.data ?? [],
  });
};

// vrati vsechny instance food podle barcodu
export const useGetFoodInstanceByBarcode = (inventoryId, barcode, memberCount = 1, enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["food-instance-barcode", inventoryId, barcode],
    queryFn: ({ signal }) => getFoodInstanceByBarcodeApi(inventoryId, barcode, signal),
    enabled: !!inventoryId && !!barcode && !!enabled && isFocused,
    staleTime: () => {
      return memberCount > 1 ? TWENTY_SEC : ONE_HOUR;
    },
    refetchInterval: () => {
      const isShared = (memberCount ?? 0) > 1;
      return isShared && isFocused ? ONE_MIN : false;
    },
    gcTime: ONE_HOUR,
    select: (data) => data?.data ?? [],
  });
};
