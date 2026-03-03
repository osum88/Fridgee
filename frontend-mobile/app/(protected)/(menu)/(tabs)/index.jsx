import {
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  SectionList,
  LayoutAnimation,
  Platform,
} from "react-native";
import { Link, router, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card } from "@/components/Card/Card";
import { CardItem } from "@/components/Card/CardItem";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useCameraNavigation } from "@/hooks/image/useCameraNavigation";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
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
import { INVENTORY_THEMES } from "@/constants/colors";
import { INVENTORY } from "@/constants/inventory";
import { InventoryFoodList } from "@/components/food/InventoryFoodList";
import { Search } from "@/components/input/Search";
import { normalizeText } from "@/utils/stringUtils";

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

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);

  const { data: inventory } = useInventoryDetail(activeInventory.id);
  const { data: inventories, isLoading: isLoadingInventory } = useFoodInventories(
    !activeInventory.id,
  );
  const {
    data: foodContent,
    refetch,
    isRefetching,
  } = useInventoryContent(activeInventory.id, activeInventory.memberCount);

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
      setSearchTitle("")
      setActiveInventory(item.id, item.title, item.role, item.memberCount);
    },
    [setActiveInventory],
  );

  const handleAddManually = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push("/addFoodManually");
    });
  }, [router]);

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
              onPress={() => navigateToScanner()}
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
                onPress={() => navigateToScanner()}
                color={colors}
                inventoryId={activeInventory.id}
              />
            </View>
          </>
        ) : (
          <MainFab
            // tlacitko pro pridani invenatare
            onPress={() => router.push("/addInventory")}
            color={colors}
            inventoryId={activeInventory.id}
          />
        )}
      </View>
    );
  }, [activeInventory.id, colors, router, navigateToScanner, handleAddManually]);

  //sekce
  const sections = useMemo(() => {
    if (!activeInventory.id || !foodContent) return [];

    return foodContent.map((cat) => {
      const isExpanded = expandedSections[cat.categoryId] !== false;
      return {
        ...cat,
        data: isExpanded ? cat.foods : [],
        isExpanded: isExpanded,
      };
    });
  }, [activeInventory.id, expandedSections, foodContent]);

  // otvira sekce
  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => {
      const isCurrentlyExpanded = prev[id] !== false;

      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  }, []);

  //filtrace foods pri vyhledavani
  const filteredSections = useMemo(() => {
    if (!searchTitle) return sections;
    return sections
      .map((section) => {
        const filteredData = section.data.filter((item) =>
          item?.normalizedTitle?.toLowerCase().includes(normalizeText(searchTitle)),
        );
        return filteredData.length > 0 ? { ...section, data: filteredData } : null;
      })
      .filter((section) => section !== null);
  }, [searchTitle, sections]);

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
              outlineStyle={[styles.outlineSearchBar, { backgroundColor: colors.cardBackground }]}
            />
          </ThemedView>
          <InventoryFoodList
            sections={filteredSections}
            toggleSection={toggleSection}
            colors={colors}
            refetch={refetch}
            isRefetching={isRefetching}
          />
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
    marginVertical:  responsiveSize.vertical(11),
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: responsiveSize.vertical(40),
  },
  outlineSearchBar: {
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});
