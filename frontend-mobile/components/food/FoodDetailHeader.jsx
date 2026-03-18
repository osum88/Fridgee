import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { ImageViewer } from "@/components/image/ImageViewer";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";

const HEADER_ACTIONS = [
  { key: "edit", icon: "pencil", color: "orange" },
  { key: "add", icon: "plus.circle", color: "validCount" },
  { key: "cart", icon: "cart.badge.plus", color: "primary" },
  { key: "category", icon: "list.bullet", color: "outlineButton" },
];

const FoodDetailHeaderComponent = ({ food, colors, colorScheme, onAction, isLoading }) => (
  <ThemedView
    style={[styles.header, colorScheme === "light" && styles.headerShadow]}
    darkColor={colors.surface}
  >
    {/* obrazek a info */}
    <View style={styles.topRow}>
      <ImageViewer
        imageUrl={
          food?.labelFoodImageUrl ? `${IMAGEKIT_URL_ENDPOINT}${food.labelFoodImageUrl}` : ""
        }
        isLoading={isLoading}
      />

      <View style={styles.infoBlock}>
        <ThemedText style={styles.headerTitle} numberOfLines={2}>
          {food?.labelTitle ?? ""}
        </ThemedText>
        {food?.variantTitle ? (
          <ThemedText
            style={[styles.headerVariant, { color: colors.text + "88" }]}
            numberOfLines={1}
          >
            {food.variantTitle}
          </ThemedText>
        ) : null}
        {food?.labelDescription ? (
          <ThemedText style={[styles.headerDescription, { color: colors.text + "77" }]}>
            {food.labelDescription}
          </ThemedText>
        ) : null}
        {food?.barcode ? (
          <View style={styles.barcodeRow}>
            <IconSymbol name="barcode" size={11} color={colors.text + "55"} />
            <ThemedText style={[styles.barcodeText, { color: colors.text + "55" }]}>
              {food.barcode}
            </ThemedText>
          </View>
        ) : null}
        {food?.minimalQuantity ? (
          <ThemedText style={[styles.minQty, { color: colors.text + "55" }]}>
            {i18n.t("minimalQuantity")}: {food.minimalQuantity}
          </ThemedText>
        ) : null}
      </View>
    </View>

    <ThemedLine style={styles.divider} />

    {/* jen ikony */}
    <View style={styles.actionsRow}>
      {HEADER_ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.actionButton, { opacity: pressed ? 0.5 : 1 }]}
          onPress={() => {
            onAction(action.key);
          }}
          hitSlop={8}
        >
          <IconSymbol
            name={action.icon}
            size={responsiveSize.moderate(22)}
            color={colors[action.color]}
          />
        </Pressable>
      ))}
    </View>
  </ThemedView>
);

export const FoodDetailHeader = React.memo(FoodDetailHeaderComponent);

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
  },
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },

  // texty
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: responsiveSize.horizontal(12),
    paddingTop: responsiveSize.vertical(14),
    paddingBottom: responsiveSize.vertical(12),
    gap: responsiveSize.horizontal(12),
  },
  infoBlock: {
    flex: 1,
    gap: responsiveSize.vertical(2),
  },
  headerTitle: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "700",
    lineHeight: responsiveSize.moderate(21),
  },
  headerVariant: {
    fontSize: responsiveSize.moderate(13),
    fontWeight: "500",
  },
  headerDescription: {
    fontSize: responsiveSize.moderate(12),
    lineHeight: responsiveSize.moderate(16),
  },
  barcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: responsiveSize.vertical(2),
  },
  barcodeText: {
    fontSize: responsiveSize.moderate(11),
  },
  minQty: {
    fontSize: responsiveSize.moderate(11),
  },
  // delici cara
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: responsiveSize.horizontal(14),
  },
  // spodni akce
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: responsiveSize.vertical(10),
    paddingHorizontal: responsiveSize.horizontal(8),
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: responsiveSize.vertical(4),
  },
});
