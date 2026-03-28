import React, { useCallback } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import Animated, { FadeIn, Layout } from "react-native-reanimated";
import { LIST_ITEM_TYPE } from "@/constants/general";
import { formatAmount, formatPrice } from "@/utils/stringUtils";
import i18n from "@/constants/translations";

const ITEM_HEIGHT = responsiveSize.vertical(60);
const SECTION_FOOTER_HEIGHT = responsiveSize.vertical(13);
const BORDER_RADIUS = responsiveSize.moderate(6);
const BORDER_WIDTH = 1;

// header shopping list
const SectionHeaderComponent = ({ item, toggleSection, colors, borderColor }) => (
  <ThemedView
    style={[
      styles.headerWrapper,
      item.isExpanded ? styles.headerExpanded : styles.headerCollapsed,
      { borderColor },
    ]}
    darkColor={colors.surface}
  >
    <Pressable
      onPress={() => toggleSection(item.shoppingListId)}
      style={[
        styles.categoryHeaderContainer,
        item.isExpanded
          ? {
              paddingTop: responsiveSize.vertical(20),
              paddingBottom: responsiveSize.vertical(15.5),
            }
          : { paddingVertical: responsiveSize.vertical(20) },
      ]}
    >
      <View style={styles.shoppingListHeader}>
        <IconSymbol name={"cart"} size={responsiveSize.moderate(20)} color={colors.text} />
        <ThemedText style={styles.shoppingListTitle}>{item.shoppingListTitle}</ThemedText>
      </View>
      <IconSymbol
        name={item.isExpanded ? "chevron.up" : "chevron.down"}
        size={responsiveSize.moderate(20)}
        color={colors.text}
      />
    </Pressable>
  </ThemedView>
);
const SectionHeader = React.memo(SectionHeaderComponent);

// konec nakupniho seznamu
const SectionEndComponent = ({ surface, borderColor }) => (
  <Animated.View entering={FadeIn.duration(200)}>
    <ThemedView style={[styles.sectionEndCap, { borderColor }]} darkColor={surface} />
  </Animated.View>
);
const SectionEnd = React.memo(SectionEndComponent);

// spacer mezi sekcemi
const SectionFooterComponent = () => <View style={styles.sectionFooter} />;
const SectionFooter = React.memo(SectionFooterComponent);

// obsah itemu
const ShoppingItemContentComponent = ({ item, surfaceColor, checkColor, onPress }) => {
  const handlePress = useCallback(() => onPress(item), [item, onPress]);

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
      <ThemedView style={styles.foodRow} darkColor={surfaceColor}>
        {/* checkbox */}
        <View style={styles.checkboxArea}>
          <View
            style={[
              styles.checkbox,
              item.isChecked && { backgroundColor: checkColor, borderWidth: 0 },
            ]}
          >
            {item.isChecked && (
              <IconSymbol name="checkmark" size={responsiveSize.moderate(16)} color="#fff" />
            )}
          </View>
        </View>

        {/* info */}
        <View style={styles.foodInfo}>
          <ThemedText
            style={[styles.foodTitle, item.isChecked && styles.checkedText]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.customTitle}
          </ThemedText>
          {(item.customVariantTitle || item.customeDescription) && (
            <ThemedText
              style={[styles.foodDescription, item.isChecked && styles.checkedText]}
              numberOfLines={2}
            >
              {[item.customVariantTitle, item.customeDescription].filter(Boolean).join(" • ")}
            </ThemedText>
          )}
        </View>

        <View style={styles.metaArea}>
          {/* quantity × amount unit */}
          <View style={styles.metaRow}>
            {item.quantity > 1 && (
              <ThemedText style={[styles.quantityBadge, item.isChecked && styles.checkedText]}>
                {item.quantity}
                {"\u00d7"}
              </ThemedText>
            )}
            {(item.amount > 0 || item.unit) && (
              <ThemedText style={[styles.amountText, item.isChecked && styles.checkedText]}>
                {formatAmount(item.amount, item.unit)}
              </ThemedText>
            )}
          </View>

          {/* cena */}
          {item.price > 0 && (
            <ThemedText style={[styles.priceText, item.isChecked && styles.checkedText]}>
              {formatPrice(item.price, item.currency)}
            </ThemedText>
          )}
        </View>
      </ThemedView>
    </Pressable>
  );
};
const ShoppingItemContent = React.memo(ShoppingItemContentComponent);

// Item wrapper s animací
const ShoppingItemComponent = ({
  item,
  surface,
  borderColor,
  surfaceColor,
  checkColor,
  onItemPress,
}) => (
  //   <Animated.View layout={Layout.springify().damping(40).stiffness(200)}>
  //   <Animated.View entering={FadeIn.duration(200)}>
  <ThemedView style={[styles.itemWrapper, { borderColor }]} darkColor={surface}>
    <ThemedLine style={styles.foodDivider} />
    <ShoppingItemContent
      item={item}
      surfaceColor={surfaceColor}
      checkColor={checkColor}
      onPress={onItemPress}
    />
  </ThemedView>
  //   </Animated.View>
);
const ShoppingItem = React.memo(ShoppingItemComponent);

const EmptyItemComponent = ({ surface, borderColor }) => (
  <ThemedView style={[styles.itemWrapper, { borderColor }]} darkColor={surface}>
    <ThemedLine style={styles.foodDivider} />
    <ThemedView style={styles.foodRow} darkColor={surface}>
      <ThemedText style={styles.emptyItemText}>{i18n.t("noShoppingListItems")}</ThemedText>
    </ThemedView>
  </ThemedView>
);
const EmptyItem = React.memo(EmptyItemComponent);

// Hlavní list komponenta
const ShoppingListFoodListComponent = ({ data, refetch, toggleSection, onItemPress }) => {
  const colors = useThemeColor();

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case LIST_ITEM_TYPE.HEADER:
          return (
            <SectionHeader
              item={item}
              colors={colors}
              toggleSection={toggleSection}
              borderColor={colors.borderCard}
            />
          );
        case LIST_ITEM_TYPE.SECTION_END:
          return <SectionEnd surface={colors.surface} borderColor={colors.borderCard} />;
        case LIST_ITEM_TYPE.FOOTER:
          return <SectionFooter />;
        case LIST_ITEM_TYPE.BOTTOM_SPACER:
          return <View style={{ height: responsiveSize.vertical(70) }} />;
        case LIST_ITEM_TYPE.EMPTY_ITEM:
          return <EmptyItem surface={colors.surface} borderColor={colors.borderCard} />;
        default:
          return (
            <ShoppingItem
              item={item}
              surface={colors.surface}
              borderColor={colors.borderCard}
              surfaceColor={colors.surface}
              onItemPress={onItemPress}
              checkColor={colors.validCount}
            />
          );
      }
    },
    [colors, onItemPress, toggleSection],
  );

  const overrideItemType = useCallback((item) => item.type, []);

  const keyExtractor = useCallback((item) => {
    if (item.type === LIST_ITEM_TYPE.HEADER) return `header-${item.shoppingListId}`;
    if (item.type === LIST_ITEM_TYPE.SECTION_END) return `end-${item.shoppingListId}`;
    if (item.type === LIST_ITEM_TYPE.FOOTER) return `footer-${item.shoppingListId}`;
    if (item.type === LIST_ITEM_TYPE.BOTTOM_SPACER) return "bottom-spacer";
    if (item.type === LIST_ITEM_TYPE.EMPTY_ITEM) return `empty-${item.shoppingListId ?? "global"}`;
    return `item-${item.id}`;
  }, []);

  return (
    <RefreshableFlashList
      data={data}
      refetch={refetch}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      overrideItemType={overrideItemType}
      estimatedItemSize={ITEM_HEIGHT}
      drawDistance={ITEM_HEIGHT * 20}
      windowSize={5}
      contentContainerStyle={styles.scrollContent}
      removeClippedSubviews={Platform.OS === "android"}
    />
  );
};
export const ShoppingListFoodList = React.memo(ShoppingListFoodListComponent);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: responsiveSize.horizontal(10),
  },
  headerWrapper: {
    paddingLeft: responsiveSize.horizontal(12),
    paddingRight: responsiveSize.horizontal(15),
    marginTop: responsiveSize.vertical(1),
    borderTopWidth: BORDER_WIDTH,
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
  },
  headerExpanded: {
    borderTopLeftRadius: BORDER_RADIUS,
    borderTopRightRadius: BORDER_RADIUS,
  },
  headerCollapsed: {
    borderRadius: BORDER_RADIUS,
    borderBottomWidth: BORDER_WIDTH,
  },

  categoryHeaderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shoppingListHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(7),
    flex: 1,
    marginRight: responsiveSize.horizontal(8),
  },
  shoppingListTitle: {
    fontSize: responsiveSize.moderate(18),
    fontWeight: "500",
    flexShrink: 1,
  },
  itemWrapper: {
    width: "100%",
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
  },
  sectionEndCap: {
    height: responsiveSize.vertical(4),
    borderLeftWidth: BORDER_WIDTH,
    borderRightWidth: BORDER_WIDTH,
    borderBottomWidth: BORDER_WIDTH,
    borderBottomLeftRadius: BORDER_RADIUS,
    borderBottomRightRadius: BORDER_RADIUS,
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    height: ITEM_HEIGHT,
    paddingHorizontal: responsiveSize.horizontal(12),
    // paddingVertical: responsiveSize.vertical(10),
    gap: responsiveSize.horizontal(10),
  },
  checkboxArea: {
    justifyContent: "center",
    alignItems: "center",
  },
  checkbox: {
    width: responsiveSize.moderate(22),
    height: responsiveSize.moderate(22),
    borderRadius: responsiveSize.moderate(6),
    borderWidth: 2,
    borderColor: "#9c9a9aff",
    justifyContent: "center",
    alignItems: "center",
  },
  foodInfo: {
    flex: 1,
    justifyContent: "center",
    gap: responsiveSize.vertical(2),
  },
  foodTitle: {
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
    lineHeight: responsiveSize.moderate(18),
  },
  checkedText: {
    opacity: 0.4,
    textDecorationLine: "line-through",
  },
  foodDescription: {
    fontSize: responsiveSize.moderate(12),
    opacity: 0.5,
    marginTop: responsiveSize.vertical(2),
  },
  metaArea: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: responsiveSize.vertical(5),
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(4),
  },
  quantityBadge: {
    fontSize: responsiveSize.moderate(13),
    fontWeight: "600",
    opacity: 0.5,
  },
  amountText: {
    fontSize: responsiveSize.moderate(14),
    fontWeight: "500",
  },
  priceText: {
    fontSize: responsiveSize.moderate(12),
    opacity: 0.5,
  },
  foodDivider: {
    height: StyleSheet.hairlineWidth,
  },
  sectionFooter: {
    height: SECTION_FOOTER_HEIGHT,
  },
  emptyItemText: {
    flex: 1,
    textAlign: "center",
    fontSize: responsiveSize.moderate(14),
    opacity: 0.4,
  },
});
