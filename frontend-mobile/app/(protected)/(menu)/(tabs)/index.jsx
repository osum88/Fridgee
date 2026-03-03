import { Image } from "expo-image";

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
  useInventoryDetail,
} from "@/hooks/queries/inventory/useInventoryQuary";

import { InventorySkeleton } from "@/components/animated/InventorySkeleton";

import { useInventoryStore } from "@/hooks/store/useInventoryStore";

import { INVENTORY_THEMES } from "@/constants/colors";

import { INVENTORY } from "@/constants/inventory";

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

const FoodComponent = ({ item, color }) => {
  const totalCount = item.expiredCount + item.expiringSoonCount + item.validCount;

  return (
    <ThemedView style={styles.foodRow} darkColor={color.surface}>
      <View style={styles.foodInfo}>
        <ThemedText style={styles.foodTitle} numberOfLines={1} ellipsizeMode="tail">
          {item.labelTitle}
        </ThemedText>

        {(item.variantTitle || item.labelDescription) && (
          <ThemedText style={styles.foodDescription} numberOfLines={2} ellipsizeMode="tail">
            {item.variantTitle ? `${item.variantTitle}${item.labelDescription ? " • " : ""}` : ""}

            {item.labelDescription || ""}
          </ThemedText>
        )}
      </View>

      <ThemedView style={styles.badgeRow} darkColor={color.surface}>
        {/* <ThemedText style={styles.mainCount}>{totalCount}x</ThemedText> */}

        <ThemedView style={styles.statusGroup} darkColor={color.surface}>
          {item.validCount > 0 && (
            <View style={[styles.dot, { backgroundColor: "#4CAF50" }]}>
              <ThemedText style={styles.dotText}>{item.validCount}</ThemedText>
            </View>
          )}

          {item.expiringSoonCount > 0 && (
            <View style={[styles.dot, { backgroundColor: "#FFC107" }]}>
              <ThemedText style={styles.dotText}>{item.expiringSoonCount}</ThemedText>
            </View>
          )}

          {item.expiredCount > 0 && (
            <View style={[styles.dot, { backgroundColor: "#F44336" }]}>
              <ThemedText style={styles.dotText}>{item.expiredCount}</ThemedText>
            </View>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const FoodItem = React.memo(FoodComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.foodId === nextProps.item.foodId &&
    prevProps.item.validCount === nextProps.item.validCount &&
    prevProps.item.expiredCount === nextProps.item.expiredCount &&
    prevProps.item.expiringSoonCount === nextProps.item.expiringSoonCount
  );
});

export default function InventoryScreen() {
  const [expandedSections, setExpandedSections] = useState({});
  const router = useRouter();
  const colors = useThemeColor();
  const { navigateToScanner } = useCameraNavigation();
  useLanguage();

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);


  // const { data: inventory } = useInventoryDetail(activeInventory.id);

  const { data: inventories, isLoading } = useFoodInventories(!activeInventory.id);

  const inventory = INVENTORY;

  // console.log(inventory)

  const handlePress = useCallback((item) => {
    setActiveInventory(item.id, item.title, item.role);

    // router.push(`/inventory/${id}`);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddManually = useCallback(() => {
    InteractionManager.runAfterInteractions(() => {
      router.push("/addFoodManually");
    });
  }, [router]);

  //vyber inventare

  const RenderInventories = useMemo(() => {
    if (activeInventory.id) return null;
    if (isLoading) {
      return [1, 2, 3, 4, 5].map((key) => <InventorySkeleton key={key} />);
    }
    return inventories?.map((item) => (
      <InventoryCard key={item.id} item={item} onPress={() => handlePress(item)} />
    ));
  }, [activeInventory.id, isLoading, inventories, handlePress]);

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

  const sections = useMemo(() => {
    if (!activeInventory.id || !INVENTORY) return [];

    return INVENTORY.map((cat) => {
      const isExpanded = expandedSections[cat.categoryId] !== false;

      return {
        ...cat,
        data: isExpanded ? cat.foods : [],
        isExpanded: isExpanded,
      };
    });
  }, [activeInventory.id, expandedSections]);

  const toggleSection = useCallback((id) => {
    setExpandedSections((prev) => {
      const isCurrentlyExpanded = prev[id] !== false;

      return { ...prev, [id]: !isCurrentlyExpanded };
    });
  }, []);

  // hlavicka kategorie
  const renderSectionHeader = useCallback(
    ({ section }) => (
      <Card style={[styles.categoryCard, section.isExpanded && styles.noBottomRadius]}>
        <Pressable
          onPress={() => toggleSection(section.categoryId)}
          style={[
            styles.categoryHeader,
            section.isExpanded
              ? {
                  paddingTop: responsiveSize.vertical(16),
                  paddingBottom: responsiveSize.vertical(10.5),
                }
              : { paddingVertical: responsiveSize.vertical(16) },
          ]}
        >
          <ThemedText style={styles.categoryTitle}>
            {section.categoryTitle === "unknow" ? i18n.t("uncategorized") : section.categoryTitle}
          </ThemedText>

          <IconSymbol
            name={section.isExpanded ? "chevron.up" : "chevron.down"}
            size={responsiveSize.moderate(20)}
            color={colors.text}
          />
        </Pressable>
      </Card>
    ),
    [colors, toggleSection],
  );

  return (
    <ThemedView style={styles.contentWrapper}>
      {activeInventory.id ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.foodId.toString()}
          renderItem={({ item, index, section }) => {
            const isLast = index === section.data.length - 1;
            return (
              <ThemedView style={[styles.itemWrapperShadow, isLast && styles.lastItemRounded]}>
                <ThemedView style={styles.itemContentInner} darkColor={colors.surface}>
                  <ThemedLine style={styles.foodDivider} />
                  <FoodItem item={item} color={colors} />
                </ThemedView>
              </ThemedView>
            );
          }}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={styles.scrollContent}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={5}
          removeClippedSubviews={Platform.OS === "android"}
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

  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: responsiveSize.vertical(60),
    paddingVertical: responsiveSize.vertical(8),
  },
  foodInfo: {
    flex: 1,
    justifyContent: "center",
    paddingRight: responsiveSize.horizontal(10),
  },
  foodTitle: {
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
    lineHeight: responsiveSize.moderate(18),
  },
  foodDescription: {
    fontSize: responsiveSize.moderate(12),
    opacity: 0.5,
    marginTop: responsiveSize.vertical(2),
    lineHeight: responsiveSize.moderate(14),
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: responsiveSize.moderate(18),
    fontWeight: "500",
  },
  mainCount: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "400",
    marginRight: responsiveSize.horizontal(10),
  },
  statusGroup: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(4),
  },
  dot: {
    minWidth: responsiveSize.moderate(22),
    height: responsiveSize.moderate(22),
    borderRadius: responsiveSize.moderate(11),
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(4),
  },
  dotText: {
    color: "#fff",
    fontSize: responsiveSize.moderate(12),
    fontWeight: "bold",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noBottomRadius: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  categoryCard: {
    marginTop: responsiveSize.vertical(12),
    borderRadius: responsiveSize.moderate(8),
    paddingHorizontal: responsiveSize.horizontal(15),
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemWrapperShadow: {
    width: "100%",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 1,
  },
  lastItemRounded: {
    borderBottomLeftRadius: responsiveSize.moderate(10),
    borderBottomRightRadius: responsiveSize.moderate(10),
    marginBottom: responsiveSize.vertical(12),
    borderBottomWidth: 0.1,
    borderColor: "transparent",
  },
  itemContentInner: {
    paddingHorizontal: responsiveSize.horizontal(15),
    paddingVertical: responsiveSize.vertical(3.5),
    borderBottomLeftRadius: responsiveSize.moderate(10),
    borderBottomRightRadius: responsiveSize.moderate(10),
    marginVertical: -1.5,
  },
  foodDivider: {
    height: 1,
    opacity: 0.7,
  },
});
