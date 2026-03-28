import { useCallback, useMemo, useState, InteractionManager } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { Search } from "@/components/input/Search";
import { EmptyState } from "@/components/common/EmptyState";
import { ThemedActivityIndicator } from "@/components/themed/ThemedActivityIndicator";
import { ShoppingListFoodList } from "@/components/shoppingList/ShoppingListFoodList";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useCameraNavigation } from "@/hooks/image/useCameraNavigation";
import { responsiveSize } from "@/utils/scale";
import { normalizeText } from "@/utils/stringUtils";
import { LIST_ITEM_TYPE } from "@/constants/general";
import i18n from "@/constants/translations";
import { useShoppingListsContent } from "@/hooks/queries/shoppingLists/useShoppingListsQuary";
import { MainFab } from "@/components/button/MainFab";
import { SecondaryFab } from "@/components/button/SecondaryFab";
import { ActionBottomSheet } from "@/components/bottomSheet/ActionBottomSheet";
import { useCreateShoppingList } from "@/hooks/queries/shoppingLists/useShoppingListsMutation";
import { handleApiError } from "@/utils/handleApiError";
import { BaseBottomSheet } from "@/components/bottomSheet/BaseBottomSheet";
import { ThemedText } from "@/components/themed/ThemedText";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";

const ACTIONS = [
  { key: "remove1", icon: "trash", color: "error" },
  { key: "edit", icon: "pencil", color: "orange" },
  { key: "check", icon: "checkmark.circle", color: "primary" },
  { key: "addToInventory", icon: "plus.circle", color: "validCount", labelSize: 10.2 },
];

export default function ShoppingListScreen() {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [expandedShoppingList, setExpandedShoppingList] = useState({});
  const [sheetVisible, setSheetVisible] = useState(false);
  const [addError, setAddError] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addVisible, setAddVisible] = useState(false);

  const router = useRouter();
  const colors = useThemeColor();
  const { navigateToScanner } = useCameraNavigation();

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const {
    data: shoppingLists,
    isLoading,
    refetch,
  } = useShoppingListsContent(activeInventory.id, activeInventory.memberCount);
  const { mutate: createList, isPending: isCreating } = useCreateShoppingList(activeInventory.id);

  const hasLists = shoppingLists && shoppingLists.length > 0;

  // Flat data pro FlashList
  const flatData = useMemo(() => {
    if (!shoppingLists || shoppingLists.length === 0) return [];

    const query = searchTitle ? normalizeText(searchTitle).toLowerCase() : null;
    const hasAnyItems = shoppingLists.some((list) => list.items.length > 0);
    const result = [];

    for (const list of shoppingLists) {
      if (hasAnyItems && list.items.length === 0) continue;
      const isExpanded = expandedShoppingList[list.id] !== false;

      const items = query
        ? list.items.filter((item) => item?.customNormalizedTitle?.toLowerCase().includes(query))
        : list.items;

      if (query && items.length === 0) continue;

      // unchecked prvni, checked na konec
      const unchecked = items.filter((i) => !i.isChecked);
      const checked = items.filter((i) => i.isChecked);
      const sortedItems = [...unchecked, ...checked];

      result.push({
        type: LIST_ITEM_TYPE.HEADER,
        shoppingListId: list.id,
        shoppingListTitle: list.shoppingListTitle,
        status: list.status,
        isExpanded,
      });
      if (isExpanded) {
        if (sortedItems.length === 0) {
          result.push({ type: LIST_ITEM_TYPE.EMPTY_ITEM, shoppingListId: list.id });
        } else {
          sortedItems.forEach((item) => {
            result.push({ type: LIST_ITEM_TYPE.ITEM, ...item });
          });
        }
        result.push({ type: LIST_ITEM_TYPE.SECTION_END, shoppingListId: list.id });
      }
      result.push({ type: LIST_ITEM_TYPE.FOOTER, shoppingListId: list.id });
    }

    if (result.length > 0) {
      result.push({ type: LIST_ITEM_TYPE.BOTTOM_SPACER });
    }

    return result;
  }, [shoppingLists, searchTitle, expandedShoppingList]);

  const handleItemPress = useCallback((item) => {
    setSheetVisible(true);
    setSelectedItem(item);
  }, []);

  //navigace pro manualni pridani jidla do seznamu
  const handleAddManually = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push("/addShoppingListItem");
    });
  }, [router]);

  //navigace na scan food pro pridani do nakupniho seznamu
  const handleScannerPress = useCallback(
    (type) => () => navigateToScanner(type, "../scannerAdd"),
    [navigateToScanner],
  );

  //navigace do seznamu nakupnich seznamu
  const handleNavigateToLists = useCallback(() => {
    router.push("/(protected)/(shoppingLists)/shoppingListsSetting");
  }, [router]);

  //navigace na pridani nakupniho seznamu
  const handleAddList = useCallback(() => {
    setAddVisible(true);
  }, []);

  //zavre modal footer
  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  //reakce na akce u instanci
  const handleActionInstance = useCallback(
    (action, item) => {
      console.log("action", action, item);
    },
    [activeInventory.id],
  );

  const handleAddSave = useCallback(() => {
    if (!addTitle.trim()) {
      setAddError(i18n.t("errors.shoppingListTitle.STRING_EMPTY"));
      return;
    }
    createList(
      { data: { title: addTitle.trim() } },
      {
        onSuccess: () => {
          setAddVisible(false);
          setAddTitle("");
          setAddError("");
        },
        onError: (error) => handleApiError(error, setAddError),
      },
    );
  }, [addTitle, createList]);

  // otvira nakupni seznamy
  const toggleSection = useCallback((id) => {
    setExpandedShoppingList((prev) => {
      const isCurrentlyExpanded = prev[id] !== false;
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  }, []);

  if (!activeInventory.id && !isLoading) {
    return (
      <ThemedView style={styles.contentWrapper}>
        <EmptyState
          icon="cart.fill"
          title={i18n.t("noShoppingListTitle")}
          subtitle={i18n.t("noShoppingListSubtitle")}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contentWrapper}>
      <ThemedView style={styles.searchContainer}>
        <Search
          placeholder={i18n.t("searchFoodPlaceholder")}
          value={searchTitle}
          onChangeText={setSearchTitle}
          style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
          outlineStyle={[styles.outlineSearchBar, { backgroundColor: colors.cardBackground }]}
        />
        <Pressable
          onPress={handleNavigateToLists}
          style={[styles.filterBtn, { backgroundColor: colors.cardBackground }]}
        >
          <IconSymbol name="list.bullet" size={responsiveSize.moderate(26)} color={colors.icon} />
        </Pressable>
      </ThemedView>

      {/* Obsah */}
      {isLoading ? (
        <ThemedActivityIndicator size="large" container={true} />
      ) : !hasLists ? (
        <EmptyState
          icon="cart.fill"
          title={i18n.t("noShoppingListTitle")}
          subtitle={i18n.t("noShoppingListSubtitle")}
        />
      ) : (
        <ShoppingListFoodList
          data={flatData}
          refetch={refetch}
          toggleSection={toggleSection}
          onItemPress={handleItemPress}
        />
      )}

      {/* tlacitka */}
      <View style={styles.fabContainer}>
        {hasLists ? (
          <>
            <View style={styles.bottomRow}>
              {/* tlacitko pro pridani itemu do nakupniho seznamu manualne */}
              <SecondaryFab
                onPress={handleAddManually}
                color={colors}
                icons={["pencil", "plus"]}
                style={styles.fabPlusManuallyPosition}
              />
              {/* tlacitko pro pridani itemu do nakupniho seznamu skenem */}
              <MainFab
                onPress={handleScannerPress("shoppingAdd")}
                color={colors}
                inventoryId={activeInventory.id}
                hasContent={true}
              />
            </View>
          </>
        ) : (
          <MainFab
            // tlacitko pro pridani invenatare
            onPress={handleAddList}
            color={colors}
            hasContent={false}
          />
        )}
      </View>

      <ActionBottomSheet
        visible={sheetVisible}
        item={selectedItem}
        colors={colors}
        onClose={handleSheetClose}
        onAction={handleActionInstance}
        action={ACTIONS}
      />
      {/* add bottom sheet */}
      <BaseBottomSheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        colors={colors}
        styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
      >
        <ThemedText style={styles.sheetTitle}>{i18n.t("addShoppingList")}</ThemedText>
        <UniversalTextInput
          value={addTitle}
          onChangeText={(text) => {
            setAddTitle(text);
            setAddError("");
          }}
          maxLength={50}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder={i18n.t("shoppingListPlaceholder")}
          error={addError}
          setError={setAddError}
        />
        <Pressable
          onPress={handleAddSave}
          disabled={isCreating}
          style={[
            styles.saveBtn,
            { backgroundColor: isCreating ? colors.text + "22" : colors.primary },
          ]}
        >
          <ThemedText style={[styles.saveBtnText, { color: colors.onPrimary }]}>
            {i18n.t("add")}
          </ThemedText>
        </Pressable>
      </BaseBottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: { flex: 1 },
  searchContainer: {
    marginHorizontal: responsiveSize.horizontal(10),
    marginVertical: responsiveSize.vertical(11),
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(10),
  },
  searchBar: {
    flex: 1,
    height: responsiveSize.vertical(42),
  },
  outlineSearchBar: {
    borderRadius: responsiveSize.moderate(6),
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
    marginHorizontal: 0,
  },
  filterBtn: {
    width: responsiveSize.vertical(44),
    height: responsiveSize.vertical(44),
    borderRadius: responsiveSize.moderate(6),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
  },
  fabContainer: {
    position: "absolute",
    bottom: responsiveSize.horizontal(17),
    right: responsiveSize.vertical(15),
    zIndex: 2,
    alignItems: "flex-end",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: responsiveSize.horizontal(14),
  },
  sheetTitle: {
    fontSize: responsiveSize.moderate(17),
    fontWeight: "600",
    marginBottom: responsiveSize.vertical(16),
  },
  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
  inputOutline: {
    borderRadius: responsiveSize.moderate(7),
  },
  saveBtn: {
    height: responsiveSize.vertical(50),
    borderRadius: responsiveSize.moderate(14),
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "600",
  },
});
