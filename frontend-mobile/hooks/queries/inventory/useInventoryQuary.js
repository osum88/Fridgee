import { useQuery } from "@tanstack/react-query";
import {  getInventoryFoodCategoriesApi } from "@/api/inventory";


// vrati vsechny jidla s kategoriemi, intancemi a labely
export const useGetInventoryCategoriesQuery = (inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["foodCategories", inventoryId],
    queryFn: () => getInventoryFoodCategoriesApi(inventoryId),
    enabled: enabled && !!inventoryId,
    staleTime: 1000 * 60 * 60, //1 hodina
  });
};
