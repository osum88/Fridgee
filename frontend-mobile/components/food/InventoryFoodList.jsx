import React, { useCallback, useState } from "react";
import { SectionList, StyleSheet, View, Pressable, Platform, RefreshControl } from "react-native";
import { Card } from "@/components/Card/Card";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

const FoodItemComponent = ({ item }) => {
  const colors = useThemeColor();
  return (
    <ThemedView style={styles.foodRow} darkColor={colors.surface}>
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

      <ThemedView style={styles.badgeRow} darkColor={colors.surface}>
        <ThemedView style={styles.statusGroup} darkColor={colors.surface}>
          {item.validCount > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.validCount }]}>
              <ThemedText style={styles.dotText}>{item.validCount}</ThemedText>
            </View>
          )}

          {item.expiringSoonCount > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.expiringSoonCount }]}>
              <ThemedText style={styles.dotText}>{item.expiringSoonCount}</ThemedText>
            </View>
          )}

          {item.expiredCount > 0 && (
            <View style={[styles.dot, { backgroundColor: colors.expiredCount }]}>
              <ThemedText style={styles.dotText}>{item.expiredCount}</ThemedText>
            </View>
          )}
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const FoodItem = React.memo(FoodItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.item.foodId === nextProps.item.foodId &&
    prevProps.item.validCount === nextProps.item.validCount &&
    prevProps.item.expiredCount === nextProps.item.expiredCount &&
    prevProps.item.expiringSoonCount === nextProps.item.expiringSoonCount
  );
});

const InventoryFoodListComponent = ({ sections, toggleSection, isRefetching, refetch }) => {
  const [lastManualRefetch, setLastManualRefetch] = useState(0);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const colors = useThemeColor();

  // zablokuje na 10s
  const handleManualRefresh = useCallback(async () => {
    const now = Date.now();
    if (now - lastManualRefetch < 10000) return;

    setLastManualRefetch(now);
    setIsManualRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsManualRefreshing(false);
    }
  }, [lastManualRefetch, refetch]);

  // render hlavicky
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
    [colors.text, toggleSection],
  );

  //render itemu
  const renderItem = useCallback(
    ({ item, index, section }) => {
      const isLast = index === section.data.length - 1;
      return (
        <ThemedView
          style={[styles.itemWrapperShadow, isLast && styles.lastItemRounded]}
          darkColor={colors.surface}
        >
          <ThemedView
            style={[styles.itemContentInner, isLast && styles.lastItemRounded]}
            darkColor={colors.surface}
          >
            <ThemedLine style={styles.foodDivider} />
            <FoodItem item={item} color={colors} />
          </ThemedView>
        </ThemedView>
      );
    },
    [colors],
  );

  //render footer
  const renderFooter = useCallback(() => {
    return <View style={{ height: responsiveSize.vertical(13) }} />;
  }, []);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.foodId.toString()}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      stickySectionHeadersEnabled={false}
      contentContainerStyle={styles.scrollContent}
      renderSectionFooter={renderFooter}
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={5}
      removeClippedSubviews={Platform.OS === "android"}
      refreshControl={
        <RefreshControl
          refreshing={isManualRefreshing}
          onRefresh={handleManualRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
          progressViewOffset={responsiveSize.vertical(10)}
        />
      }
    />
  );
};

export const InventoryFoodList = React.memo(InventoryFoodListComponent);

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: responsiveSize.horizontal(10),
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: responsiveSize.vertical(60),
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
    marginTop: responsiveSize.vertical(1),
    marginVertical: 0,
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
    marginBottom: responsiveSize.vertical(4),
    borderBottomWidth: 0.1,
    borderColor: "transparent",
  },
  itemContentInner: {
    paddingHorizontal: responsiveSize.horizontal(15),
    paddingBottom: responsiveSize.vertical(4),
    borderBottomLeftRadius: responsiveSize.moderate(10),
    borderBottomRightRadius: responsiveSize.moderate(10),
    marginVertical: -1.5,
  },
  foodDivider: {
    height: 1,
    opacity: 0.7,
  },
});
