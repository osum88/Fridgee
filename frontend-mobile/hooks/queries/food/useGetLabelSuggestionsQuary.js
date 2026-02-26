import { useQuery } from "@tanstack/react-query";
import { getInventorySuggestionsApi } from "@/api/inventory";

//hleda jidlo podle stringu
export const useGetLabelSuggestionsQuary = (labelTitle, inventoryId, enabled = true) => {
  return useQuery({
    queryKey: ["labelSuggestions", labelTitle, inventoryId],
    queryFn: () => getInventorySuggestionsApi(inventoryId, labelTitle),
    enabled: enabled && !!labelTitle && !!inventoryId,
    staleTime: 1000 * 30, //20 sekund
    placeholderData: (previousData) => previousData,
  });
};
