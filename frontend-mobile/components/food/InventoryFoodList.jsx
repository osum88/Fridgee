import React, { useCallback, useRef } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LIST_ITEM_TYPE } from "@/constants/general";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import Animated, { FadeIn } from "react-native-reanimated";

const ITEM_HEIGHT = responsiveSize.vertical(60);
const SECTION_FOOTER_HEIGHT = responsiveSize.vertical(13);
const BORDER_RADIUS = responsiveSize.moderate(6);
const BORDER_WIDTH = 1;

//leva akce komponenty
const LeftActionCompoment = ({ color }) => (
  <View
    style={[
      styles.swipeAction,
      { backgroundColor: color, paddingLeft: responsiveSize.horizontal(18) },
    ]}
  >
    <IconSymbol name="cart.badge.plus" size={24} color="#fff" />
  </View>
);
const LeftAction = React.memo(LeftActionCompoment);

//prava akce komponenty
const RightActionCompoment = ({ color }) => (
  <View
    style={[
      styles.swipeAction,
      {
        backgroundColor: color,
        paddingRight: responsiveSize.horizontal(18),
        alignItems: "flex-end",
      },
    ]}
  >
    <ThemedText style={styles.swipeText}>-1</ThemedText>
  </View>
);
const RightAction = React.memo(RightActionCompoment);

//header flatlistu
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
      onPress={() => toggleSection(item.categoryId)}
      style={[
        styles.categoryHeader,
        item.isExpanded
          ? {
              paddingTop: responsiveSize.vertical(20),
              paddingBottom: responsiveSize.vertical(15.5),
            }
          : { paddingVertical: responsiveSize.vertical(20) },
      ]}
    >
      <ThemedText style={styles.categoryTitle}>
        {item.categoryTitle === "unknow" ? i18n.t("uncategorized") : item.categoryTitle}
      </ThemedText>
      <IconSymbol
        name={item.isExpanded ? "chevron.up" : "chevron.down"}
        size={responsiveSize.moderate(20)}
        color={colors.text}
      />
    </Pressable>
  </ThemedView>
);
const SectionHeader = React.memo(SectionHeaderComponent);

//konec sekce
const SectionEndComponent = ({ surface, borderColor }) => (
  <Animated.View entering={FadeIn.duration(200)}>
    <ThemedView style={[styles.sectionEndCap, { borderColor }]} darkColor={surface} />
  </Animated.View>
);
const SectionEnd = React.memo(SectionEndComponent);

//mezera mezi sekcemi
const SectionFooterComponent = () => <View style={styles.sectionFooter} />;
const SectionFooter = React.memo(SectionFooterComponent);

//obsah itemu
const FoodItemContentComponent = ({
  item,
  surfaceColor,
  validCountColor,
  expiringSoonCountColor,
  expiredCountColor,
}) => {
  const handlePress = useCallback(() => {
    router.push({
      pathname: "/foodDetail",
      params: { foodId: item.foodId, catalogId: item.catalogId },
    });
  }, [item.foodId, item.catalogId]);

  return (
    <Pressable onPress={handlePress}>
      <ThemedView style={styles.foodRow} darkColor={surfaceColor}>
        <View style={styles.foodInfo}>
          <ThemedText style={styles.foodTitle} numberOfLines={1} ellipsizeMode="tail">
            {item.labelTitle}
          </ThemedText>
          {(item.variantTitle || item.labelDescription) && (
            <ThemedText style={styles.foodDescription} numberOfLines={2} ellipsizeMode="tail">
              {item.variantTitle ? `${item.variantTitle}${item.labelDescription ? " • " : ""}` : ""}
              {item.labelDescription ?? ""}
            </ThemedText>
          )}
        </View>

        <ThemedView style={styles.statusGroup} darkColor={surfaceColor}>
          {item.validCount > 0 && (
            <View style={[styles.dot, { backgroundColor: validCountColor }]}>
              <ThemedText style={styles.dotText}>{item.validCount}</ThemedText>
            </View>
          )}
          {item.expiringSoonCount > 0 && (
            <View style={[styles.dot, { backgroundColor: expiringSoonCountColor }]}>
              <ThemedText style={styles.dotText}>{item.expiringSoonCount}</ThemedText>
            </View>
          )}
          {item.expiredCount > 0 && (
            <View style={[styles.dot, { backgroundColor: expiredCountColor }]}>
              <ThemedText style={styles.dotText}>{item.expiredCount}</ThemedText>
            </View>
          )}
        </ThemedView>
      </ThemedView>
    </Pressable>
  );
};

const FoodItemContent = React.memo(
  FoodItemContentComponent,
  (prev, next) =>
    prev.item.foodId === next.item.foodId &&
    prev.item.validCount === next.item.validCount &&
    prev.item.expiredCount === next.item.expiredCount &&
    prev.item.expiringSoonCount === next.item.expiringSoonCount &&
    prev.item.labelDescription === next.item.labelDescription &&
    prev.item.labelTitle === next.item.labelTitle &&
    prev.item.normalizedTitle === next.item.normalizedTitle &&
    prev.item.variantTitle === next.item.variantTitle &&
    prev.item.variantId === next.item.variantId &&
    prev.surfaceColor === next.surfaceColor &&
    prev.validCountColor === next.validCountColor &&
    prev.expiringSoonCountColor === next.expiringSoonCountColor &&
    prev.expiredCountColor === next.expiredCountColor,
);

// itemy
const FoodItemComponent = ({
  item,
  primaryColor,
  errorColor,
  surfaceColor,
  validCountColor,
  expiringSoonCountColor,
  expiredCountColor,
  surface,
  borderColor,
}) => {
  const swipeableRef = useRef(null);

  //akce pridani do kosiku
  const handleAddToCart = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log("Odečteno:", item.foodId);
    swipeableRef.current?.close();
  }, [item.foodId]);

  //akce spotrebovani
  const handleRemove = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log("Přidáno do košíku:", item.foodId);
    swipeableRef.current?.close();
  }, [item.foodId]);

  const renderLeft = useCallback(() => <LeftAction color={primaryColor} />, [primaryColor]);
  const renderRight = useCallback(() => <RightAction color={errorColor} />, [errorColor]);

  const handleSwipeOpen = useCallback(
    (direction) => {
      if (direction === "left") handleAddToCart();
      else handleRemove();
    },
    [handleAddToCart, handleRemove],
  );

  return (
    // <Animated.View entering={FadeIn.duration(200)}>
    <ThemedView style={[styles.itemWrapper, { borderColor }]} darkColor={surface}>
      <ThemedLine style={styles.foodDivider} />
      {/* <ReanimatedSwipeable
        ref={swipeableRef}
        renderLeftActions={renderLeft}
        renderRightActions={renderRight}
        onSwipeableWillOpen={handleSwipeOpen}
        friction={2}
        leftThreshold={40}
        rightThreshold={40}
      > */}
      <FoodItemContent
        item={item}
        surfaceColor={surfaceColor}
        validCountColor={validCountColor}
        expiringSoonCountColor={expiringSoonCountColor}
        expiredCountColor={expiredCountColor}
      />
      {/* </ReanimatedSwipeable> */}
    </ThemedView>
    // </Animated.View>
  );
};

const FoodItem = React.memo(
  FoodItemComponent,
  (prev, next) =>
    prev.item.foodId === next.item.foodId &&
    prev.item.validCount === next.item.validCount &&
    prev.item.expiredCount === next.item.expiredCount &&
    prev.item.expiringSoonCount === next.item.expiringSoonCount &&
    prev.item.labelDescription === next.item.labelDescription &&
    prev.item.labelTitle === next.item.labelTitle &&
    prev.item.normalizedTitle === next.item.normalizedTitle &&
    prev.item.variantTitle === next.item.variantTitle &&
    prev.item.variantId === next.item.variantId &&
    prev.primaryColor === next.primaryColor &&
    prev.errorColor === next.errorColor &&
    prev.surfaceColor === next.surfaceColor &&
    prev.validCountColor === next.validCountColor &&
    prev.expiringSoonCountColor === next.expiringSoonCountColor &&
    prev.expiredCountColor === next.expiredCountColor &&
    prev.surface === next.surface &&
    prev.borderColor === next.borderColor,
);

const InventoryFoodListComponent = ({ data, toggleSection, refetch }) => {
  const colors = useThemeColor();

  const renderItem = useCallback(
    ({ item }) => {
      switch (item.type) {
        case LIST_ITEM_TYPE.HEADER:
          return (
            <SectionHeader
              item={item}
              toggleSection={toggleSection}
              colors={colors}
              borderColor={colors.borderCard}
            />
          );
        case LIST_ITEM_TYPE.SECTION_END:
          return <SectionEnd surface={colors.surface} borderColor={colors.borderCard} />;
        case LIST_ITEM_TYPE.FOOTER:
          return <SectionFooter />;
        case LIST_ITEM_TYPE.BOTTOM_SPACER:
          return <View style={{ height: responsiveSize.vertical(100) }} />;
        default:
          return (
            <FoodItem
              item={item}
              primaryColor={colors.primary}
              errorColor={colors.error}
              surfaceColor={colors.surface}
              validCountColor={colors.validCount}
              expiringSoonCountColor={colors.expiringSoonCount}
              expiredCountColor={colors.expiredCount}
              surface={colors.surface}
              borderColor={colors.borderCard}
            />
          );
      }
    },
    [colors, toggleSection],
  );

  const overrideItemType = useCallback((item) => item.type, []);

  const keyExtractor = useCallback((item) => {
    if (item.type === LIST_ITEM_TYPE.HEADER) return `header-${item.categoryId}`;
    if (item.type === LIST_ITEM_TYPE.SECTION_END) return `end-${item.categoryId}`;
    if (item.type === LIST_ITEM_TYPE.FOOTER) return `footer-${item.categoryId}`;
    if (item.type === LIST_ITEM_TYPE.BOTTOM_SPACER) return "bottom-spacer";
    return `item-${item.foodId}`;
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
export const InventoryFoodList = React.memo(InventoryFoodListComponent);

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: responsiveSize.horizontal(10),
  },
  headerWrapper: {
    paddingHorizontal: responsiveSize.horizontal(15),
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
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryTitle: {
    fontSize: responsiveSize.moderate(18),
    fontWeight: "500",
  },
  foodRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: ITEM_HEIGHT,
    paddingHorizontal: responsiveSize.horizontal(15),
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
    includeFontPadding: false,
  },
  foodDescription: {
    fontSize: responsiveSize.moderate(12),
    opacity: 0.5,
    marginTop: responsiveSize.vertical(2),
    lineHeight: responsiveSize.moderate(14),
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
  foodDivider: {
    height: StyleSheet.hairlineWidth,
  },
  swipeAction: {
    width: responsiveSize.horizontal(80),
    justifyContent: "center",
    height: "100%",
  },
  swipeText: {
    color: "#fff",
    fontSize: responsiveSize.moderate(17),
    fontWeight: "600",
  },
  sectionFooter: {
    height: SECTION_FOOTER_HEIGHT,
  },
});
