import { useQuery } from "@tanstack/react-query";
import { useIsFocused } from "@react-navigation/native";
import { getShoppingListsContentApi, getShoppingListsLightApi } from "../../../api/shoppingLists";

const THIRTY_SEC = 1000 * 30;
const ONE_MIN = 60 * 1000;
const ONE_HOUR = 1000 * 60 * 60;
const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

export const useShoppingListsContent = (inventoryId, memberCount = 1, enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["shopping-lists", parseInt(inventoryId)],
    queryFn: ({ signal }) => getShoppingListsContentApi(inventoryId, signal),
    enabled: !!inventoryId && isFocused && !!enabled,
    staleTime: memberCount > 1 ? THIRTY_SEC : ONE_WEEK,
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

//vraci vsechny seznamy nakupu
export const useShoppingListsOnly = (inventoryId, memberCount = 1, enabled = true) => {
  const isFocused = useIsFocused();

  return useQuery({
    queryKey: ["shopping-lists-only", parseInt(inventoryId)],
    queryFn: ({ signal }) => getShoppingListsLightApi(inventoryId, signal),
    enabled: !!inventoryId && isFocused && !!enabled,
    staleTime: memberCount > 1 ? THIRTY_SEC : ONE_WEEK,
    gcTime: ONE_HOUR,
    refetchInterval: () => {
      const isShared = (memberCount ?? 0) > 1;
      return isShared && isFocused ? ONE_MIN : false;
    },
    select: (data) => data?.data ?? [],
    notifyOnChangeProps: ["data", "status", "error"],
  });
};
