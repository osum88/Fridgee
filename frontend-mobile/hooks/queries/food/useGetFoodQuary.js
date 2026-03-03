import { useQuery } from "@tanstack/react-query";
import { getInventorySuggestionsApi } from "@/api/inventory";
import { getFoodByBarcodeApi } from "@/api/catalog";

//hleda jidlo podle stringu
export const useGetLabelSuggestionsQuary = (labelTitle, inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["labelSuggestions", labelTitle, inventoryId],
    queryFn: ({ signal }) => getInventorySuggestionsApi(inventoryId, labelTitle, 6, signal),
    enabled: enabled && !!labelTitle && !!inventoryId,
    staleTime: 1000 * 20,
    placeholderData: (previousData) => previousData,
  });
};

//hleda jidlo podle barcodu
export const useGetFoodByBarcodeQuary = (barcode, inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["labelSuggestions", barcode, inventoryId],
    queryFn: ({ signal })=> getFoodByBarcodeApi(barcode, inventoryId, signal),
    enabled: enabled && !!barcode && !!inventoryId,
  });
};

