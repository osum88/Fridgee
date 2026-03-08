import {
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  LayoutAnimation,
} from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCameraNavigation } from "@/hooks/image/useCameraNavigation";
import { responsiveSize } from "@/utils/scale";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { BadgedIcon } from "@/components/icons/BadgedIcon";
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
import { useTheme } from "@/contexts/ThemeContext";
import { LIST_ITEM_TYPE } from "@/constants/general";

//hlavni tlacitko (prida inventar nebo presmeruje na sken)
const MainFab = ({ onPress, color, inventoryId }) => (
  <Pressable onPress={onPress} style={[styles.fabMain, { backgroundColor: color.primary }]}>
    {inventoryId ? (
      <BadgedIcon
        icons={["barcode.viewfinder", "plus"]}
        size={responsiveSize.moderate(30)}
        color={color.onPrimary}
        lightColorBackground={color.primary}
        darkColorBackground={color.primary}
      />
    ) : (
      <IconSymbol name={"plus"} size={responsiveSize.moderate(38)} color={color.onPrimary} />
    )}
  </Pressable>
);

//mensi tlacitka
const SecondaryFab = ({ onPress, color, badgeIcons, style }) => (
  <Pressable
    onPress={onPress}
    style={[styles.fabSecondary, { backgroundColor: color.secondButton }, style]}
  >
    <BadgedIcon
      icons={badgeIcons}
      size={responsiveSize.moderate(22)}
      color={color.onPrimary}
      lightColorBackground={color.secondButton}
      darkColorBackground={color.secondButton}
    />
  </Pressable>
);

//prazdny inventar
const EmptyInventory = ({ colors }) => (
  <View style={styles.emptyContainer}>
    <IconSymbol
      name="basket"
      size={responsiveSize.moderate(80)}
      color={colors.text}
      style={{ opacity: 0.2 }}
    />
    <ThemedText style={styles.emptyTitle}>{i18n.t("noFoodTitle")}</ThemedText>
    <ThemedText style={styles.emptySubtitle}>{i18n.t("noFoodSubtitle")}</ThemedText>
  </View>
);

export default function InventoryScreen() {
  const [expandedSections, setExpandedSections] = useState({});
  const [searchTitle, setSearchTitle] = useState("");
  const router = useRouter();
  const colors = useThemeColor();
  const { navigateToScanner } = useCameraNavigation();
  useLanguage();
  const { colorScheme } = useTheme();

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);

  const { data: inventory } = useInventoryDetail(activeInventory.id);
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
        setActiveInventory(id, title, role, memberCount);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventory, activeInventory.id]);

  //vyber inventare
  const handlePress = useCallback(
    (item) => {
      setSearchTitle("");
      setActiveInventory(item.id, item.title, item.role, item.memberCount);
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
  const handleScannerPress = useCallback(() => navigateToScanner(), [navigateToScanner]);

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
              onPress={handleScannerPress}
              color={colors}
              badgeIcons={["barcode.viewfinder", "minus"]}
              style={styles.fabMinusPosition}
            />
            <View style={styles.bottomRow}>
              {/* tlacitko pro pridani food manualne */}
              <SecondaryFab
                onPress={handleAddManually}
                color={colors}
                badgeIcons={["pencil", "plus"]}
                style={styles.fabPlusManuallyPosition}
              />
              {/* tlacitko pro pridani food skenem */}
              <MainFab
                onPress={handleScannerPress}
                color={colors}
                inventoryId={activeInventory.id}
              />
            </View>
          </>
        ) : (
          <MainFab
            // tlacitko pro pridani invenatare
            onPress={handleNavigateAddInventory}
            color={colors}
            inventoryId={activeInventory.id}
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
    return result;
  }, [sections, expandedSections, searchTitle]);

  if (!activeInventory.id) {
    return (
      <ThemedView style={styles.contentWrapper}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.inventoryList}>{RenderInventories}</View>
        </ScrollView>
        {FoodActionsFab}
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.contentWrapper}>
      {isLoadingInventory ? (
        <InventorySkeleton />
      ) : sections && sections.length > 0 ? (
        <ThemedView style={{ flex: 1 }}>
          <ThemedView style={styles.searchContainer}>
            <Search
              placeholder={i18n.t("searchFoodPlaceholder")}
              value={searchTitle}
              onChangeText={setSearchTitle}
              style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
              outlineStyle={[
                styles.outlineSearchBar,
                colorScheme === "light" && styles.shadow,
                { backgroundColor: colors.cardBackground },
              ]}
            />
          </ThemedView>
          <InventoryFoodList data={flatData} toggleSection={toggleSection} refetch={refetch} />
        </ThemedView>
      ) : (
        <EmptyInventory colors={colors} />
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(40),
    marginBottom: responsiveSize.vertical(60),
  },
  emptyTitle: {
    fontSize: responsiveSize.moderate(20),
    fontWeight: "600",
    marginTop: responsiveSize.vertical(20),
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: responsiveSize.moderate(14),
    opacity: 0.6,
    marginTop: responsiveSize.vertical(10),
    textAlign: "center",
    lineHeight: responsiveSize.moderate(20),
  },
  searchContainer: {
    paddingHorizontal: responsiveSize.horizontal(1),
    marginVertical: responsiveSize.vertical(11),
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: responsiveSize.vertical(44),
  },
  outlineSearchBar: {
    borderRadius: responsiveSize.moderate(8),
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
    // elevation: 4,
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
  },
});
