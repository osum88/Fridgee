import React, { useState, useCallback, useMemo } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useLocalSearchParams } from "expo-router";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { InstanceItem } from "@/components/food/InstanceItem";
import { ConsumeModal } from "@/components/bottomSheet/ConsumeBottomSheet";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetFoodInstanceByBarcode } from "@/hooks/queries/inventory/useInventoryQuary";
import { useConsumeFoodInstanceMutation } from "@/hooks/queries/instance/useFoodInstanceMutation";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { useTheme } from "@/contexts/ThemeContext";
import { useQueryClient } from "@tanstack/react-query";
import { ITEM_TYPE_HEADER, ITEM_TYPE_INSTANCE } from "@/constants/general";
import { EmptyState } from "@/components/common/EmptyState";

const ITEM_HEIGHT = responsiveSize.vertical(60);

export default function ConsumeBarcodeScreen() {
  const colors = useThemeColor();
  const { colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { barcode } = useLocalSearchParams();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const queryClient = useQueryClient();

  const [consumeModal, setConsumeModal] = useState({ visible: false, item: null });

  const {
    data: barcodeData,
    isLoading,
    refetch,
  } = useGetFoodInstanceByBarcode(activeInventory?.id, barcode, activeInventory?.memberCount);

  const { consumeInstance } = useConsumeFoodInstanceMutation(activeInventory?.id);

  const handleItemPress = useCallback((item) => {
    setConsumeModal({ visible: true, item });
  }, []);

  // flatten data
  const flatData = useMemo(() => {
    if (!barcodeData) return [];
    const result = [];
    barcodeData?.variants?.forEach((variant) => {
      result.push({
        type: ITEM_TYPE_HEADER,
        variantTitle: variant?.variantTitle,
        moreVariant: barcodeData?.variants?.length > 1,
      });
      variant.instances.forEach((instance) => {
        result.push({
          type: ITEM_TYPE_INSTANCE,
          ...instance,
          variantTitle: variant.variantTitle,
        });
      });
    });
    return result;
  }, [barcodeData]);

  const renderItem = useCallback(
    ({ item }) => {
      if (item.type === ITEM_TYPE_HEADER && item.moreVariant) {
        return (
          <ThemedText style={[styles.variantHeader, { color: colors.text + "77" }]}>
            {item.variantTitle ? item.variantTitle : i18n.t("noVariant")}
          </ThemedText>
        );
      }
      if (item.type === ITEM_TYPE_HEADER && !item.moreVariant) {
        return <View style={[styles.variantHeaderEmpty]} />;
      }
      return (
        <InstanceItem
          item={item}
          colors={colors}
          borderColor={colors.borderCard}
          onPress={handleItemPress}
        />
      );
    },
    [colors, handleItemPress],
  );

  const keyExtractor = useCallback(
    (item, index) =>
      item.type === ITEM_TYPE_HEADER
        ? `header-${item.variantTitle}-${index}`
        : String(item.instanceIds[0]),
    [],
  );

  const getItemType = useCallback((item) => item.type, []);

  return (
    <ThemedView style={{ flex: 1 }}>
      {isLoading ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator size={"large"} />
        </ThemedView>
      ) : barcodeData?.instances?.length === 0 ? (
        <EmptyState
          icon="barcode"
          title={i18n.t("productNotFoundTitle")}
          subtitle={i18n.t("productNotFoundSubtitle")}
        />
      ) : (
        <>
          <ThemedView
            style={[styles.foodHeader, colorScheme === "light" && styles.headerShadow]}
            darkColor={colors.surface}
          >
            <View style={styles.topRow}>
              <ImageViewer
                imageUrl={
                  barcodeData?.labelFoodImageUrl
                    ? `${IMAGEKIT_URL_ENDPOINT}${barcodeData.labelFoodImageUrl}`
                    : ""
                }
                isLoading={isLoading}
              />
              <View style={styles.infoBlock}>
                <ThemedText style={styles.headerTitle} numberOfLines={2}>
                  {barcodeData?.labelTitle ?? ""}
                </ThemedText>
                {barcodeData?.labelDescription ? (
                  <ThemedText style={[styles.headerDescription, { color: colors.text + "77" }]}>
                    {barcodeData.labelDescription}
                  </ThemedText>
                ) : null}
                {barcode ? (
                  <View style={styles.barcodeRow}>
                    <IconSymbol name="barcode" size={responsiveSize.moderate(12)} color={colors.text + "55"} />
                    <ThemedText style={[styles.barcodeText, { color: colors.text + "55" }]}>
                      {barcode}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
            <ThemedLine style={styles.divider} />
          </ThemedView>

          <RefreshableFlashList
            data={flatData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            getItemType={getItemType}
            estimatedItemSize={ITEM_HEIGHT}
            refetch={refetch}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + responsiveSize.vertical(20) },
            ]}
            ListEmptyComponent={
              !isLoading ? (
                <ThemedView style={styles.empty}>
                  <ThemedText>{i18n.t("noInstances")}</ThemedText>
                </ThemedView>
              ) : null
            }
          />
        </>
      )}

      <ConsumeModal
        visible={consumeModal.visible}
        item={consumeModal.item}
        colors={colors}
        onClose={() => setConsumeModal({ visible: false, item: null })}
        onConfirm={({ data }) => {
          consumeInstance.mutate(data, {
            onSuccess: () => {
              queryClient.refetchQueries({
                queryKey: ["food-instance-barcode", parseInt(activeInventory?.id)],
              });
            },
          });
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: responsiveSize.horizontal(12),
  },
  foodHeader: {
    zIndex: 10,
  },
  headerShadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: responsiveSize.horizontal(12),
    paddingTop: responsiveSize.vertical(16),
    paddingBottom: responsiveSize.vertical(14),
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
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: responsiveSize.horizontal(14),
  },
  instancesLabel: {
    fontSize: responsiveSize.moderate(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginHorizontal: responsiveSize.horizontal(12),
    marginVertical: responsiveSize.vertical(10),
  },
  variantHeader: {
    fontSize: responsiveSize.moderate(14),
    fontWeight: "500",
    paddingTop: responsiveSize.vertical(16),
    paddingBottom: responsiveSize.vertical(8),
  },
  variantHeaderEmpty: {
    paddingTop: responsiveSize.vertical(16),
  },
  empty: {
    padding: responsiveSize.moderate(35),
    alignItems: "center",
  },
});
