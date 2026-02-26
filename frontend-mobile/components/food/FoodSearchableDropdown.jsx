import { useState, useMemo, memo } from "react";
import i18n from "@/constants/translations";
import { SearchableDropdown } from "@/components/input/SearchableDropdown";
import { useDebounce } from "../../hooks/debounce/useDebounce";
import { useGetLabelSuggestionsQuary } from "../../hooks/queries/food/useGetLabelSuggestionsQuary";

function FoodSearchableDropdownComponent({
  inputText,
  setInputText,
  setSelectedCatalog,
  inventoryId,
  inputColor,
  error,
  setError,
  ...props
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ziskani navrhu pro hledani
  const { data: suggestions } = useGetLabelSuggestionsQuary(
    debouncedSearchTerm,
    inventoryId,
    debouncedSearchTerm.length > 0,
  );

  //transformace polozek pro dropdown menu
  const dropdownItems = useMemo(() => {
    if (!inputText || inputText.length <= 0) {
      return [];
    }
   const dataToMap = suggestions?.data || [];
    
    return dataToMap.map((food) => ({
      label: food.title,
      value: food.catalogId.toString(),
    }));
  }, [suggestions?.data, inputText]);

  return (
    <SearchableDropdown
      value={searchTerm || ""}
      onChange={(catalogId) => {
        const foundFood = suggestions?.data?.find((food) => food.catalogId === Number(catalogId));
        setSelectedCatalog(foundFood || null);
      }}
      searchTerm={inputText}
      onChangeSearchTerm={(text) => {
        setSearchTerm(text);
        setInputText(text);
        if (error) setError("");
      }}
      label={i18n.t("foodName")}
      isSubmitting={false}
      items={dropdownItems}
      placeholder={i18n.t("enterFoodName")}
      disableFiltering={true}
      showDropdownIcon={false}
      showNoResult={false}
      disableAutoSelect={true}
      inputColor={inputColor}
      error={error}
      setError={setError}
      {...props}
    />
  );
}

export const FoodSearchableDropdown = memo(FoodSearchableDropdownComponent);
