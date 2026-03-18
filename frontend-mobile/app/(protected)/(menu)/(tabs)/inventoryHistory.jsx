import { useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet, ActivityIndicator, Pressable } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { responsiveSize } from "@/utils/scale";
import {
  useInventoryHistory,
  useGetUsersByInventoryId,
} from "@/hooks/queries/inventory/useInventoryQuary";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import { useQueryClient } from "@tanstack/react-query";
import { EmptyState } from "@/components/common/EmptyState";
import { useTheme } from "@/contexts/ThemeContext";
import { HistoryItem } from "@/components/history/HistoryItem";
import { Search } from "@/components/input/Search";
import { useDebounce } from "@/hooks/debounce/useDebounce";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { HistoryFilterSheet } from "@/components/bottomSheet/HistoryFilterBottomSheet";

export default function InventoryHistoryScreen() {
  const [filters, setFilters] = useState({});
  const [filterVisible, setFilterVisible] = useState(false);
  const [search, setSearch] = useState("");

  const listRef = useRef(null);

  const colors = useThemeColor();
  const queryClient = useQueryClient();
  const { colorScheme } = useTheme();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const debouncedSearch = useDebounce(search, 200);

  //quary pro historii
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInventoryHistory(
    activeInventory.id,
    { ...filters, search: debouncedSearch ?? "" },
    activeInventory.memberCount,
  );

  //vrati vsechny usery z invenatre
  const { data: users } = useGetUsersByInventoryId(
    activeInventory.id,
    activeInventory.memberCount,
    "resultName",
    filterVisible,
  );

  //pri zmene vyhledavani scrolluje na top
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [debouncedSearch]);

  //pri zmene inventare se resetuje filtr
  useEffect(() => {
    setFilters({});
    setSearch("");
  }, [activeInventory.id]);

  //refresh potahnuti
  const handleRefresh = useCallback(() => {
    queryClient.resetQueries({ queryKey: ["inventory-history", parseInt(activeInventory.id)] });
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [queryClient, activeInventory.id]);

  const hasFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
  );

  //flat items
  const items = data?.pages.flatMap((page) => page.data.items) ?? [];

  const renderItem = useCallback(
    ({ item }) => <HistoryItem item={item} colors={colors} colorScheme={colorScheme} />,
    [colors, colorScheme],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  //konec nateneho seznamu
  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!activeInventory?.id) {
    return (
      <ThemedView style={styles.center}>
        <EmptyState
          icon="clock.arrow.trianglehead.counterclockwise.rotate.90"
          title={i18n.t("noInventorySelected")}
          subtitle={i18n.t("selectInventoryForHistory")}
        />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={styles.searchContainer}>
        <Search
          placeholder={i18n.t("searchFoodPlaceholder")}
          value={search || ""}
          onChangeText={setSearch}
          style={[styles.searchBar, { backgroundColor: colors.cardBackground }]}
          outlineStyle={[styles.outlineSearchBar, { backgroundColor: colors.cardBackground }]}
        />
        <Pressable
          onPress={() => setFilterVisible(true)}
          style={[
            styles.filterBtn,
            { backgroundColor: colors.cardBackground },
            hasFilters && { backgroundColor: colors.primary },
          ]}
        >
          <IconSymbol
            name="line.3.horizontal.decrease"
            size={responsiveSize.moderate(26)}
            color={hasFilters ? colors.onPrimary : colors.text}
          />
        </Pressable>
      </ThemedView>
      <HistoryFilterSheet
        visible={filterVisible}
        filters={filters}
        users={users}
        colors={colors}
        onClose={() => setFilterVisible(false)}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setFilterVisible(false);
          listRef.current?.scrollToOffset({ offset: 0, animated: false });
        }}
      />
      {isLoading ? (
        <ThemedView style={styles.center}>
          <ActivityIndicator />
        </ThemedView>
      ) : items.length === 0 ? (
        <EmptyState
          icon="clock.arrow.trianglehead.counterclockwise.rotate.90"
          title={i18n.t("noHistory")}
        />
      ) : (
        <RefreshableFlashList
          ref={listRef}
          data={items}
          renderItem={renderItem}
          refetch={handleRefresh}
          keyExtractor={keyExtractor}
          estimatedItemSize={120}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.3}
          contentContainerStyle={styles.content}
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.footer} /> : null
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: responsiveSize.horizontal(10),
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  footer: {
    marginVertical: responsiveSize.vertical(16),
  },
  searchContainer: {
    marginHorizontal: responsiveSize.horizontal(10),
    marginVertical: responsiveSize.vertical(11),
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(10),
  },
  searchBar: {
    flex: 1,
    height: responsiveSize.vertical(42),
  },
  outlineSearchBar: {
    borderRadius: responsiveSize.moderate(6),
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
    marginHorizontal: 0,
  },
  filterBtn: {
    width: responsiveSize.vertical(44),
    height: responsiveSize.vertical(44),
    borderRadius: responsiveSize.moderate(6),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.17)",
  },
});
