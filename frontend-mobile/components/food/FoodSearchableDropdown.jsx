import { useState, useEffect, useMemo } from "react";
import i18n from "@/constants/translations";
import { SearchableDropdown } from "@/components/input/SearchableDropdown";
import { useDebounce } from "../../hooks/debounce/useDebounce";
import { useGetLabelSuggestionsQuary } from "../../hooks/food/useGetLabelSuggestionsQuary";

export function FoodSearchableDropdown({
  setInputText,
  setCategories,
  setSelectedCatalog,
  inputColor,
  error,
  setError,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const inventoryId = 19; //TODO nahradit id
  const debouncedSearchTerm = useDebounce(searchTerm, 50);

  // ziskani navrhu pro hledani
  const { data: suggestions } = useGetLabelSuggestionsQuary(
    debouncedSearchTerm,
    inventoryId,
    debouncedSearchTerm.length > 1,
  );

  // nastaveni kategorii pro hlavni komponentu, aby se mohly pouzit pro zobrazeni kategorie u polozky
  useEffect(() => {
    if (suggestions?.data?.categories && suggestions.data.categories.length > 0) {
      setCategories(suggestions.data.categories);
    }
  }, [suggestions?.data?.categories, setCategories]);

  //transformcae polozek pro dropdown menu
  const dropdownItems = useMemo(() => {
    return (
      suggestions?.data?.foods?.map((food) => ({
        label: food.title,
        value: food.catalogId.toString(),
      })) || []
    );
  }, [suggestions?.data?.foods]);

  return (
    <SearchableDropdown
      value={searchTerm || ""}
      onChange={(catalogId) => {
        const foundFood = suggestions?.data?.foods?.find(
          (food) => food.catalogId === Number(catalogId),
        );
        setSelectedCatalog(foundFood || null);
      }}
      onChangeSearchTerm={(text) => {
        setSearchTerm(text);
        setInputText(text);
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
    />
  );
}
