import React, { useState, useCallback, useMemo } from "react";
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { DeleteAlert } from "@/components/modals/DeleteAlert";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import i18n from "@/constants/translations";
import { Card } from "@/components/Card/Card";
import { CardItem } from "@/components/Card/CardItem";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { formatAmount, formatPrice, getCurrency } from "@/utils/stringUtils";
import { useUser } from "@/hooks/useUser";
import { useGetUserQuery } from "@/hooks/queries/user/useUserQuery";
import { useDeleteFoodLabel } from "@/hooks/queries/foodLabel/useFoodLabelMutation";
import { useQueryClient } from "@tanstack/react-query";
import { useGetFoodLabel } from "@/hooks/queries/foodLabel/useFoodLabelQuery";

export default function FoodLabelDetailScreen() {
  const [deleteVisible, setDeleteVisible] = useState(false);

  const { id } = useLocalSearchParams();
  //   const foodLabel = JSON.parse(initialData);
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const { userId } = useUser();
  const { data: userData } = useGetUserQuery(userId);
  const { mutate: deleteFoodLabel } = useDeleteFoodLabel();
  const queryClient = useQueryClient();
  const { data: foodLabel, isLoading } = useGetFoodLabel(id);

  const currency = useMemo(() => {
    if (!userData?.data?.country) return "CZK";
    return getCurrency(userData.data.country);
  }, [userData?.data?.country]);

  const handleEdit = useCallback(() => {
    router.push({
      pathname: "/(protected)/(inventoryFoods)/editFoodLabel",
      params: { initialData: JSON.stringify(foodLabel) },
    });
  }, [foodLabel]);

  const handleDeleteConfirm = useCallback(() => {
    deleteFoodLabel(
      { foodLabelId: parseInt(id) },
      {
        onSuccess: async () => {
          queryClient.invalidateQueries({ queryKey: ["available-food-labels"] });
          queryClient.invalidateQueries({ queryKey: ["food-label", id] });
          router.back();
        },
      },
    );
  }, [id, deleteFoodLabel, queryClient]);

  if (isLoading) {
    return (
      <ThemedView style={styles.center}>
        <ActivityIndicator size={"large"} />
      </ThemedView>
    );
  }
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + responsiveSize.vertical(24) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={styles.headerCard}>
          {foodLabel.isInventoryLabel && (
            <IconSymbol
              name="archivebox"
              size={responsiveSize.moderate(22)}
              color={colors.text + "77"}
              style={styles.archivebox}
            />
          )}
          <ImageViewer
            imageUrl={
              foodLabel.foodImageUrl ? `${IMAGEKIT_URL_ENDPOINT}${foodLabel.foodImageUrl}` : ""
            }
            isLoading={false}
            imageStyle={styles.image}
          />

          <ThemedText style={styles.title} numberOfLines={2}>
            {foodLabel.title}
          </ThemedText>

          {foodLabel.description ? (
            <ThemedText style={[styles.description, { color: colors.text + "77" }]}>
              {foodLabel.description}
            </ThemedText>
          ) : null}
        </View>

        {/* info */}
        <Card>
          <CardItem
            iconName="barcode"
            iconSize={responsiveSize.moderate(19)}
            label={i18n.t("barcode")}
            value={foodLabel.barcode ?? "—"}
          />
          <ThemedLine style={{ height: 1 }} />
          <CardItem
            iconName="scalemass"
            iconSize={responsiveSize.moderate(19)}
            label={i18n.t("amount")}
            value={foodLabel.amount > 0 ? formatAmount(foodLabel.amount, foodLabel.unit) : "—"}
          />
          <ThemedLine style={{ height: 1 }} />
          <CardItem
            iconName="dollarsign"
            iconSize={responsiveSize.moderate(19)}
            label={i18n.t("price")}
            value={foodLabel.price > 0 ? formatPrice(foodLabel.price, currency) : "—"}
          />
        </Card>

        {/* tlacitka */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={handleEdit}
            activeOpacity={0.8}
          >
            <IconSymbol name="pencil" size={responsiveSize.moderate(16)} color="#fff" />
            <ThemedText style={styles.editLabel}>{i18n.t("edit")}</ThemedText>
          </TouchableOpacity>

          {!foodLabel.isInventoryLabel && (
            <TouchableOpacity
              style={[styles.deleteButton, { backgroundColor: colors.errorBackground }]}
              onPress={() => setDeleteVisible(true)}
              activeOpacity={0.8}
            >
              <IconSymbol name="trash" size={responsiveSize.moderate(16)} color={colors.error} />
              <ThemedText style={[styles.deleteLabel, { color: colors.error }]}>
                {i18n.t("delete")}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      <DeleteAlert
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        title={i18n.t("deleteCatalog")}
        description={[i18n.t("removeCatalogConfirm")]}
        deleteItem={`„${foodLabel.title}“`}
        questionMark
        onConfirm={handleDeleteConfirm}
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
  scroll: {
    paddingHorizontal: responsiveSize.horizontal(16),
    paddingTop: responsiveSize.vertical(16),
    gap: responsiveSize.vertical(12),
  },

  /* header */
  headerCard: {
    borderRadius: responsiveSize.moderate(16),
    paddingTop: responsiveSize.vertical(12),
    paddingHorizontal: responsiveSize.horizontal(5),
    alignItems: "center",
    gap: responsiveSize.vertical(13),
  },
  image: {
    width: responsiveSize.moderate(90),
    height: responsiveSize.moderate(90),
    borderRadius: responsiveSize.moderate(14),
    borderWidth: 0,
  },
  title: {
    fontSize: responsiveFont(20),
    fontWeight: "700",
    textAlign: "center",
  },
  description: {
    fontSize: responsiveFont(13.5),
    textAlign: "center",
    lineHeight: responsiveFont(19),
  },

  /* tlacitka */
  actions: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(12),
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(8),
    paddingVertical: responsiveSize.vertical(13),
    borderRadius: responsiveSize.moderate(12),
  },
  editLabel: {
    fontSize: responsiveFont(15),
    fontWeight: "600",
    color: "#fff",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(8),
    paddingVertical: responsiveSize.vertical(13),
    borderRadius: responsiveSize.moderate(12),
  },
  deleteLabel: {
    fontSize: responsiveFont(15),
    fontWeight: "600",
  },
  archivebox: {
    position: "absolute",
    zIndex: 10,
    right: responsiveSize.horizontal(-8),
    top: responsiveSize.vertical(-5),
  },
});
