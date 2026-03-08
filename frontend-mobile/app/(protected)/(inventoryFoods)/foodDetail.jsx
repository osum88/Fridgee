import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useTheme } from "@/contexts/ThemeContext";
import i18n from "@/constants/translations";
import { useLocalSearchParams, router } from "expo-router";
import { useFoodDetail } from "@/hooks/queries/food/useGetFoodQuary";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { FoodDetailHeader } from "@/components/food/FoodDetailHeader";
import { InstanceItem } from "@/components/food/InstanceItem";
import { InstanceBottomSheet } from "@/components/animated/InstanceBottomSheet";
import { CounterModal } from "@/components/modals/CounterModal";
import { ConsumeModal } from "@/components/modals/ConsumeModal";
import {
  useConsumeFoodInstanceMutation,
  useDuplicateFoodInstanceMutation,
  useDeleteFoodInstanceMutation,
} from "@/hooks/queries/instance/useFoodInstanceMutation";
import { RefreshableFlashList } from "../../../components/common/RefreshableFlashList";

const ITEM_HEIGHT = responsiveSize.vertical(60);

export default function FoodDetailScreen() {
  const colors = useThemeColor();
  const { colorScheme } = useTheme();
  const [selectedItem, setSelectedItem] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [counterModal, setCounterModal] = useState({ visible: false, action: null });
  const [consumeModal, setConsumeModal] = useState({ visible: false, item: null });

  const { foodId, catalogId } = useLocalSearchParams();
  const activeInventory = useInventoryStore((state) => state.activeInventory);

  //vraci food detail
  const {
    data: foodData,
    isLoading,
    refetch,
  } = useFoodDetail(activeInventory.id, catalogId, foodId, activeInventory.memberCount);

  //konzumace
  const { consumeInstance } = useConsumeFoodInstanceMutation(activeInventory.id, catalogId, foodId);
  //duplikace
  const { duplicateInstance } = useDuplicateFoodInstanceMutation(
    activeInventory.id,
    catalogId,
    foodId,
  );
  //smaze instanci
  const { deleteInstance } = useDeleteFoodInstanceMutation(activeInventory.id, catalogId, foodId);

  const borderColor = colorScheme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.16)";

  const handleItemPress = useCallback((item) => {
    setSelectedItem(item);
    setSheetVisible(true);
  }, []);

  const handleSheetClose = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleAction = useCallback(
    (action, item) => {
      if (action === "remove1" || action === "add") {
        setCounterModal({ visible: true, action, item });
      }
      if (action === "consume") {
        setSheetVisible(false);
        setConsumeModal({ visible: true, item });
      }
      if (action === "edit") {
        router.push({
          pathname: "../editInstance",
          params: {
            initialData: JSON.stringify(item),
            catalogId: catalogId,
            foodId: foodData?.foodId,
            variantId: foodData?.variantId,
            variantTitle: foodData?.variantTitle,
            inventoryId: activeInventory.id,
          },
        });
      }
    },
    [activeInventory.id, catalogId, foodData?.variantId, foodData?.variantTitle, foodData?.foodId],
  );

  const handleEditPress = useCallback(() => {
    router.push({ pathname: "/editFood", params: { id: foodData?.foodId } });
  }, [foodData?.foodId]);

  const renderItem = useCallback(
    ({ item }) => (
      <InstanceItem
        item={item}
        colors={colors}
        borderColor={borderColor}
        onPress={handleItemPress}
      />
    ),
    [colors, borderColor, handleItemPress],
  );

  const keyExtractor = useCallback((item) => String(item.instanceIds[0]), []);

  const totalCount =
    (foodData?.expiredCount ?? 0) +
    (foodData?.expiringSoonCount ?? 0) +
    (foodData?.validCount ?? 0);

  const ListHeader = useMemo(
    () => (
      <ThemedText style={[styles.listSectionTitle, { color: colors.text + "97" }]}>
        {i18n.t("instances")} ({totalCount})
      </ThemedText>
    ),
    [colors.text, totalCount],
  );

  return (
    <ThemedView style={styles.container}>
      <FoodDetailHeader
        food={foodData}
        colors={colors}
        colorScheme={colorScheme}
        onEditPress={handleEditPress}
        isLoading={isLoading}
      />
      <RefreshableFlashList
        data={foodData?.instances ?? []}
        refetch={refetch}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={ITEM_HEIGHT}
        drawDistance={ITEM_HEIGHT * 8}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.listContent}
      />

      <CounterModal
        visible={counterModal.visible}
        action={counterModal.action}
        item={counterModal.item}
        colors={colors}
        onClose={() => setCounterModal({ visible: false, action: null })}
        onConfirm={(action, data) => {
          if (action === "remove1") {
            deleteInstance.mutate(data?.data);
          } else if (action === "add") {
            duplicateInstance.mutate(data?.data);
          }
        }}
      />
      <ConsumeModal
        visible={consumeModal.visible}
        item={consumeModal.item}
        colors={colors}
        onClose={() => setConsumeModal({ visible: false, item: null })}
        onConfirm={({ data }) => {
          consumeInstance.mutate(data);
        }}
      />
      <InstanceBottomSheet
        visible={sheetVisible}
        item={selectedItem}
        colors={colors}
        onClose={handleSheetClose}
        onAction={handleAction}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: responsiveSize.horizontal(12),
    paddingBottom: responsiveSize.vertical(30),
  },
  listSectionTitle: {
    fontSize: responsiveSize.moderate(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    marginTop: responsiveSize.vertical(16),
    marginBottom: responsiveSize.vertical(8),
    marginLeft: responsiveSize.horizontal(2),
  },
});
