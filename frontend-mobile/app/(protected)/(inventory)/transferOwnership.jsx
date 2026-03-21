import React, { useState, useCallback, useLayoutEffect } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { Search } from "@/components/input/Search";
import { StyleSheet, TouchableOpacity } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@/constants/translations";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useGetUsersByInventoryId } from "@/hooks/queries/inventory/useInventoryQuary";
import { useNavigation } from "expo-router";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useLeaveInventory } from "@/hooks/queries/inventory/useInventoryMutation";
import { capitalizeFirst } from "@/utils/stringUtils";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { DeleteAlert } from "@/components/modals/DeleteAlert";

const UserItemComponent = ({ item, colors, selected, onPress }) => {
  return (
    <TouchableOpacity style={[styles.itemContainer]} onPress={() => onPress(item.userId)}>
      <ImageViewer
        imageUrl={`${IMAGEKIT_URL_ENDPOINT}/users/${item.userId}/profile/profile_${item.userId}_150x150.webp`}
        isLoading={false}
        isImagePlaceholder={true}
        imageStyle={styles.profileImage}
      />
      <ThemedView style={styles.textContainer}>
        <ThemedView style={styles.nameRow}>
          <ThemedText style={styles.username} numberOfLines={1} ellipsizeMode="tail">
            {item.username}
          </ThemedText>
        </ThemedView>
        {item.name && item.surname && (
          <ThemedText style={styles.fullName} numberOfLines={1} ellipsizeMode="tail">
            {capitalizeFirst(item.name)} {capitalizeFirst(item.surname)}
          </ThemedText>
        )}
      </ThemedView>
      {selected && (
        <IconSymbol
          size={responsiveSize.moderate(24)}
          name="checkmark"
          color={colors.tint}
          style={styles.iconCheck}
        />
      )}
    </TouchableOpacity>
  );
};

const UserItem = React.memo(UserItemComponent);

export default function TransferOwnershipScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const [leaveVisible, setLeaveVisible] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const { data: users, isLoading } = useGetUsersByInventoryId(
    activeInventory?.id,
    activeInventory?.memberCount,
    "username",
  );
  const { mutate: leaveInventory, isPending } = useLeaveInventory();

  const filteredUsers =
    users
      ?.filter((u) => u.role !== "OWNER")
      ?.filter(
        (u) =>
          u.resultName.toLowerCase().includes(search.toLowerCase()) ||
          u.username.toLowerCase().includes(search.toLowerCase()),
      ) ?? [];

  const handleSave = useCallback(() => {
    if (!selectedUserId) return;
    leaveInventory({ inventoryId: activeInventory?.id, newOwnerId: selectedUserId });
  }, [selectedUserId, leaveInventory, activeInventory?.id]);

  const handleConfirmLeave = useCallback(() => {
    if (!selectedUserId) return;
    setLeaveVisible(true);
  }, [selectedUserId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={isPending || !selectedUserId} onPress={handleConfirmLeave}>
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isPending}
            color={colors}
            text={i18n.t("transfer")}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, isPending, handleSave, selectedUserId, handleConfirmLeave]);

  const renderItem = useCallback(
    ({ item }) => (
      <UserItem
        item={item}
        colors={colors}
        selected={selectedUserId === item.userId}
        onPress={setSelectedUserId}
      />
    ),
    [colors, selectedUserId],
  );

  const keyExtractor = useCallback((item) => String(item.userId), []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={[styles.searchContainer, styles.container]}>
        <Search
          placeholder={i18n.t("searchUsername")}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          outlineStyle={{ marginHorizontal: 0 }}
        />
      </ThemedView>

      <FlashList
        data={filteredUsers}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={58}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom }]}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedView style={styles.empty}>
              <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
            </ThemedView>
          ) : null
        }
      />
      <DeleteAlert
        visible={leaveVisible}
        setVisible={setLeaveVisible}
        description={[i18n.t("leaveInventoryConfirm")]}
        deleteItem={activeInventory?.title}
        questionMark={true}
        confirmLabel={i18n.t("leave")}
        onConfirm={handleSave}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(14),
  },
  searchContainer: {
    paddingBottom: responsiveSize.vertical(10),
    paddingTop: responsiveSize.vertical(12),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
  },
  empty: {
    padding: responsiveSize.moderate(15),
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(12),
  },
  profileImage: {
    width: responsiveSize.moderate(55),
    height: responsiveSize.moderate(55),
    borderRadius: responsiveSize.moderate(50),
    marginEnd: responsiveSize.horizontal(12),
    borderWidth: 0,
  },
  name: {
    fontSize: responsiveFont(15),
    fontWeight: "500",
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  username: {
    fontSize: responsiveFont(15),
    lineHeight: responsiveSize.vertical(19),
    fontWeight: "600",
    flexShrink: 1,
  },
  fullName: {
    fontSize: responsiveFont(12),
    opacity: 0.6,
    flexShrink: 1,
  },
});
