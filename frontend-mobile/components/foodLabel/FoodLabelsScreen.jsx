import React, { useCallback, useEffect, useRef } from "react";
import { StyleSheet, View, ActivityIndicator, Pressable } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import i18n from "@/constants/translations";
import { useGetAvailableFoodLabels } from "@/hooks/queries/foodLabel/useFoodLabelQuery";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import { useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Search } from "@/components/input/Search";
import { useDebounce } from "@/hooks/debounce/useDebounce";
import { useFoodLabelStore } from "@/hooks/store/useFoodLabelStore";
import { EmptyState } from "@/components/common/EmptyState";
import { FoodLabelSkeletonList } from "@/components/foodLabel/FoodLabelSkeleton";

const LabelItemComponent = ({ item, colors, onPress }) => (
  <Pressable
    onPress={() => onPress(item)}
    style={() => [styles.itemContainer, { backgroundColor: colors.background }]}
  >
    <ImageViewer
      imageUrl={item.foodImageUrl ? `${IMAGEKIT_URL_ENDPOINT}${item.foodImageUrl}` : ""}
      isLoading={false}
      imageStyle={styles.image}
    />
    <ThemedView style={styles.textContainer}>
      <ThemedText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
        {item.title}
      </ThemedText>
      {item.description ? (
        <ThemedText
          style={[styles.description, { color: colors.text + "77" }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.description}
        </ThemedText>
      ) : null}
      {item.barcode ? (
        <View style={styles.barcodeRow}>
          <IconSymbol
            name="barcode"
            size={responsiveSize.moderate(12)}
            color={colors.text + "55"}
          />
          <ThemedText style={[styles.barcode, { color: colors.text + "55" }]}>
            {item.barcode}
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
    {item?.isInventoryLabel && (
      <IconSymbol
        name="archivebox"
        size={responsiveSize.moderate(18)}
        color={colors.text + "66"}
        style={styles.icon}
      />
    )}
  </Pressable>
);

const LabelItem = React.memo(LabelItemComponent);

export default function FoodLabelsScreen({ source }) {
  const listRef = useRef(null);
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { search, setSearch } = useFoodLabelStore();
  const { colorScheme } = useTheme();
  const debouncedSearch = useDebounce(search, 200);

  const {
    data: labels,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAvailableFoodLabels(source, debouncedSearch);

  useEffect(() => {
    return () => useFoodLabelStore.getState().clearSearch();
  }, []);

  const handlePress = useCallback((item) => {
    router.push(`/(protected)/(inventoryFoods)/foodLabelDetail/${item.id}`);
  }, []);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [debouncedSearch]);

  //konec nacteneho seznamu
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  //refresh potahnuti
  const handleRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: ["available-food-labels", source, search] });
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [queryClient, source, search]);

  const renderItem = useCallback(
    ({ item }) => <LabelItem item={item} colors={colors} onPress={handlePress} />,
    [colors, handlePress],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <ThemedView style={{ flex: 1 }}>
      {colorScheme === "light" && <ThemedLine style={styles.line} />}
      <ThemedView style={styles.searchContainer}>
        <Search
          placeholder={i18n.t("searchFriends")}
          value={search || ""}
          onChangeText={setSearch}
          style={[styles.search]}
        />
      </ThemedView>
      {isLoading ? (
        <FoodLabelSkeletonList count={8} />
      ) : labels?.length === 0 && !search ? (
        <EmptyState
          icon="book.closed"
          title={i18n.t("catalogNotFoundTitle")}
          subtitle={i18n.t("catalogNotFoundSubtitle")}
          style={{ marginBottom: responsiveSize.vertical(120) }}
        />
      ) : (
        <RefreshableFlashList
          ref={listRef}
          data={labels ?? []}
          renderItem={renderItem}
          refetch={handleRefresh}
          keyExtractor={keyExtractor}
          estimatedItemSize={72}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + responsiveSize.vertical(10) },
          ]}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null
          }
          ListEmptyComponent={
            <ThemedView style={styles.empty}>
              <ThemedText>{i18n.t("catalogNotFound")}</ThemedText>
            </ThemedView>
          }
        />
      )}
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
    paddingHorizontal: responsiveSize.horizontal(16),
    // paddingTop: responsiveSize.vertical(8),
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(12),
    gap: responsiveSize.horizontal(12),
  },
  image: {
    width: responsiveSize.moderate(50),
    height: responsiveSize.moderate(50),
    borderRadius: responsiveSize.moderate(10),
    borderWidth: 0,
  },
  textContainer: {
    flex: 1,
    gap: responsiveSize.vertical(2),
  },
  title: {
    fontSize: responsiveFont(15),
    fontWeight: "600",
  },
  description: {
    fontSize: responsiveFont(13),
  },
  barcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: responsiveSize.vertical(1),
  },
  barcode: {
    fontSize: responsiveFont(11),
  },
  empty: {
    padding: responsiveSize.moderate(15),
    alignItems: "center",
  },
  footer: {
    paddingVertical: responsiveSize.vertical(16),
  },
  line: {
    width: "100%",
    height: responsiveSize.vertical(0.7),
  },
  icon: {
    marginRight: responsiveSize.horizontal(3),
  },
  searchContainer: {
    paddingHorizontal: responsiveSize.horizontal(5),
    paddingTop: responsiveSize.vertical(12),
    paddingBottom: responsiveSize.vertical(4),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    paddingVertical: responsiveSize.vertical(10),
  },
});
