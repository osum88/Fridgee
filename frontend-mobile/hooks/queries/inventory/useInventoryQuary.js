import {  useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInventoryFoodCategoriesApi,
  getInventoryDetailsApi,
  getAllFoodInventoriesApi,
} from "@/api/inventory";
import { useIsFocused } from "@react-navigation/native";
import { useEffect } from "react";
import { INVENTORY_THEMES } from "@/constants/colors";

// vrati vsechny kategorie z inventare
export const useGetInventoryCategoriesQuery = (inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["foodCategories", inventoryId],
    queryFn: ({ signal }) => getInventoryFoodCategoriesApi(inventoryId, signal),
    enabled: enabled && !!inventoryId,
    staleTime: 1000 * 60 * 60, //1 hodina
  });
};

//vrati vsechny inventare
export const useFoodInventories = (enabled = true) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventories"],
    queryFn: ({ signal }) => getAllFoodInventoriesApi(signal),
    staleTime: 5 * 60 * 1000,
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
        queryClient.setQueryData(["food-inventory", inventory.id], {
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
  const TWO_MINUTE = 1000 * 60 * 2;
  const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;

  return useQuery({
    queryKey: ["food-inventory", inventoryId],
    queryFn: ({ signal }) => getInventoryDetailsApi(inventoryId, signal),
    enabled: !!inventoryId && isFocused && enabled,
    //pokud inventory ma vic jak 1 membera pak cache je validovana
    staleTime: (query) => {
      return query.state.data?.memberCount > 1 ? TWO_MINUTE : ONE_WEEK;
    },

    // automaticky refetch na
    refetchInterval: (query) => {
      return query.state.data?.memberCount > 1 ? TWO_MINUTE : false;
    },
  });
};
