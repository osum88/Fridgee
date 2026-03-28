import { InteractionManager, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCameraNavigation } from "@/hooks/image/useCameraNavigation";
import { responsiveSize } from "@/utils/scale";
import { IconSymbol } from "@/components/icons/IconSymbol";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { InventoryCard } from "@/components/Card/InventoryCard";
import {
  useFoodInventories,
  useInventoryContent,
  useInventoryDetail,
} from "@/hooks/queries/inventory/useInventoryQuary";
import { InventorySkeleton } from "@/components/animated/InventorySkeleton";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { InventoryFoodList } from "@/components/food/InventoryFoodList";
import { Search } from "@/components/input/Search";
import { normalizeText } from "@/utils/stringUtils";
import { LIST_ITEM_TYPE } from "@/constants/general";
import { EmptyState } from "@/components/common/EmptyState";
import { ThemedActivityIndicator } from "@/components/themed/ThemedActivityIndicator";
import { MainFab } from "@/components/button/MainFab";
import { SecondaryFab } from "@/components/button/SecondaryFab";

export default function InventoryScreen() {
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTitle, setSearchTitle] = useState("");
  const router = useRouter();
  const colors = useThemeColor();
  const { navigateToScanner } = useCameraNavigation();
  useLanguage();

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);

  const { data: inventory, isLoading: isLoadingFood } = useInventoryDetail(activeInventory.id);
  const { data: inventories, isLoading: isLoadingInventory } = useFoodInventories(
    !activeInventory.id,
  );
  const { data: foodContent, refetch } = useInventoryContent(
    activeInventory.id,
    activeInventory.memberCount,
  );

  // synchronizace pokud se data na serveru zmenila
  useEffect(() => {
    if (inventory?.data && activeInventory.id) {
      const { id, title, role, memberCount } = inventory.data;
      if (
        title !== activeInventory.title ||
        role !== activeInventory.role ||
        memberCount !== activeInventory.memberCount
      ) {
        setActiveInventory({ id, title, role, memberCount });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, activeInventory.id]);

  //vyber inventare
  const handlePress = useCallback(
    (item) => {
      setSearchTitle("");
      setActiveInventory({
        id: item.id,
        title: item.title,
        role: item.role,
        memberCount: item.memberCount,
      });
    },
    [setActiveInventory],
  );

  const handleAddManually = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push("/addFoodManually");
    });
  }, [router]);

  const handleNavigateAddInventory = useCallback(() => {
    router.push("/addInventory");
  }, [router]);

  // FAB tlačítka — stabilní callbacky, žádné inline funkce
  const handleScannerPress = useCallback(
    (type) => () => navigateToScanner(type, "../scannerAdd"),
    [navigateToScanner],
  );

  // otvira sekce
  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => {
      const isCurrentlyExpanded = prev[id] !== false;
      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  }, []);

  //vyber inventare
  const RenderInventories = useMemo(() => {
    if (activeInventory.id) return null;
    if (isLoadingInventory) {
      return [1, 2, 3, 4, 5].map((key) => <InventorySkeleton key={key} />);
    }
    return inventories?.map((item) => (
      <InventoryCard key={item.id} item={item} onPress={() => handlePress(item)} />
    ));
  }, [activeInventory.id, isLoadingInventory, inventories, handlePress]);

  //tlacitka
  const FoodActionsFab = useMemo(() => {
    return (
      <View style={styles.fabContainer}>
        {activeInventory.id ? (
          <>
            {/* tlacitko pro odebrani food skenem */}
            <SecondaryFab
              onPress={handleScannerPress("consume")}
              color={colors}
              icons={["barcode.viewfinder", "minus"]}
              style={styles.fabMinusPosition}
            />
            <View style={styles.bottomRow}>
              {/* tlacitko pro pridani food manualne */}
              <SecondaryFab
                onPress={handleAddManually}
                color={colors}
                icons={["pencil", "plus"]}
                style={styles.fabPlusManuallyPosition}
              />
              {/* tlacitko pro pridani food skenem */}
              <MainFab onPress={handleScannerPress("add")} color={colors} hasContent={true} />
            </View>
          </>
        ) : (
          <MainFab
            // tlacitko pro pridani invenatare
            onPress={handleNavigateAddInventory}
            color={colors}
            hasContent={false}
          />
        )}
      </View>
    );
  }, [
    activeInventory.id,
    colors,
    handleAddManually,
    handleScannerPress,
    handleNavigateAddInventory,
  ]);

  //sekce
  const sections = useMemo(() => {
    if (!activeInventory.id || !foodContent) return [];
    return foodContent;
  }, [activeInventory.id, foodContent]);

  // Flat array pro FlashList
  const flatData = useMemo(() => {
    if (!sections.length) return [];

    const query = searchTitle ? normalizeText(searchTitle).toLowerCase() : null;
    const result = [];

    for (const section of sections) {
      const isExpanded = expandedSections[section.categoryId] !== false;

      const foods = query
        ? section.foods.filter((item) => item?.normalizedTitle?.toLowerCase().includes(query))
        : section.foods;

      if (query && foods.length === 0) continue;

      // Header — kategorie
      result.push({
        type: LIST_ITEM_TYPE.HEADER,
        categoryId: section.categoryId,
        categoryTitle: section.categoryTitle,
        isExpanded,
      });

      if (isExpanded && foods.length > 0) {
        // Items
        foods.forEach((food) => {
          result.push({ type: LIST_ITEM_TYPE.ITEM, ...food });
        });

        // Section end — zaoblene rohy dole
        result.push({
          type: LIST_ITEM_TYPE.SECTION_END,
          categoryId: section.categoryId,
        });
      }

      // Footer — spacer mezi sekcemi
      result.push({
        type: LIST_ITEM_TYPE.FOOTER,
        categoryId: section.categoryId,
      });
    }
    if (result.length > 0) {
      result.push({
        type: LIST_ITEM_TYPE.BOTTOM_SPACER,
        categoryId: "bottom-spacer",
      });
    }
    return result;
  }, [sections, expandedSections, searchTitle]);

  if (!activeInventory.id) {
    return (
      <ThemedView style={styles.contentWrapper}>
        {!isLoadingInventory && (!inventories || inventories.length === 0) ? (
          <EmptyState
            icon={"archivebox"}
            title={i18n.t("noInventoryTitle")}
            subtitle={i18n.t("noInventorySubtitle")}
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.inventoryList}>{RenderInventories}</View>
          </ScrollView>
        )}
        {FoodActionsFab}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contentWrapper}>
      <ThemedView style={{ flex: 1 }}>
        <ThemedView style={styles.searchContainer}>
          <Search
            placeholder={i18n.t("searchFoodPlaceholder")}
            value={searchTitle}
            onChangeText={setSearchTitle}
            style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
            outlineStyle={[styles.outlineSearchBar, { backgroundColor: colors.cardBackground }]}
          />
          <Pressable
            onPress={() => router.push("/(protected)/(inventory)/inventorySettings")}
            style={[styles.settingButton, { backgroundColor: colors.cardBackground }]}
          >
            <IconSymbol name="gearshape" size={responsiveSize.moderate(26)} color={colors.icon} />
          </Pressable>
        </ThemedView>
        {isLoadingFood ? (
          <ThemedActivityIndicator size={"large"} container={true} />
        ) : sections && sections.length === 0 ? (
          <EmptyState
            icon={"basket"}
            title={i18n.t("noFoodTitle")}
            subtitle={i18n.t("noFoodSubtitle")}
          />
        ) : (
          <InventoryFoodList data={flatData} toggleSection={toggleSection} refetch={refetch} />
        )}
      </ThemedView>
      {FoodActionsFab}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: responsiveSize.horizontal(10),
  },
  inventoryList: {
    paddingVertical: responsiveSize.vertical(10),
  },
  fabContainer: {
    position: "absolute",
    bottom: responsiveSize.horizontal(17),
    right: responsiveSize.vertical(15),
    alignItems: "flex-end",
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: responsiveSize.horizontal(14),
  },
  fabMain: {
    width: responsiveSize.horizontal(56),
    height: responsiveSize.vertical(56),
    borderRadius: responsiveSize.moderate(18),
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabSecondary: {
    width: responsiveSize.horizontal(40),
    height: responsiveSize.vertical(40),
    borderRadius: responsiveSize.moderate(12),
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabMinusPosition: {
    marginBottom: responsiveSize.vertical(14),
    marginRight: responsiveSize.horizontal(2),
  },
  fabPlusManuallyPosition: {
    marginBottom: responsiveSize.vertical(2),
  },
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
  settingButton: {
    width: responsiveSize.vertical(44),
    height: responsiveSize.vertical(44),
    borderRadius: responsiveSize.moderate(6),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
  },
});
