import React, { useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";

import { Search } from "@/components/input/Search";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { Pressable, StyleSheet, View } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@/constants/translations";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useGetUsersByInventoryId } from "@/hooks/queries/inventory/useInventoryQuary";
import { DeleteAlert } from "@/components/modals/DeleteAlert";
import { capitalizeFirst } from "@/utils/stringUtils";
import { ROLE_LABEL_MAP } from "@/constants/inventory";
import { RoleEditModal } from "@/components/modals/RoleEditModal";
import { RefreshableFlashList } from "@/components/common/RefreshableFlashList";
import {
  useChangeRoleInventoryUser,
  useDeleteInventoryUser,
} from "@/hooks/queries/inventory/useInventoryMutation";

// Badge pro roli
const RoleBadge = ({ role, colors }) => {
  const roleColors = {
    OWNER: colors.primary,
    EDITOR: colors.orange,
    USER: colors.text + "66",
  };
  return (
    <View style={[styles.roleBadge, { borderColor: roleColors[role] }]}>
      <ThemedText style={[styles.roleBadgeText, { color: roleColors[role] }]}>
        {ROLE_LABEL_MAP[role]}
      </ThemedText>
    </View>
  );
};

// Item uzivatele
const UserItemComponent = ({ item, isOwner, colors, onEdit, onRemove }) => {
  return (
    <ThemedView style={styles.itemContainer}>
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
          <RoleBadge role={item.role} colors={colors} />
        </ThemedView>
        {item.name && item.surname && (
          <ThemedText style={styles.fullName} numberOfLines={1} ellipsizeMode="tail">
            {capitalizeFirst(item.name)} {capitalizeFirst(item.surname)}
          </ThemedText>
        )}
      </ThemedView>

      {isOwner && item.role !== "OWNER" && (
        <View style={styles.actionBtns}>
          <Pressable
            onPress={() => onEdit(item)}
            style={({ pressed }) => [
              styles.iconBtn,
              { opacity: pressed ? 0.6 : 1, backgroundColor: colors.surface },
            ]}
          >
            <IconSymbol
              name="pencil"
              size={responsiveSize.moderate(16)}
              color={colors.notFoccusIcon}
            />
          </Pressable>
          <Pressable
            onPress={() => onRemove(item)}
            style={({ pressed }) => [
              styles.iconBtn,
              { opacity: pressed ? 0.6 : 1, backgroundColor: colors.errorBackground },
            ]}
          >
            <IconSymbol name="xmark" size={responsiveSize.moderate(16)} color={colors.error} />
          </Pressable>
        </View>
      )}
    </ThemedView>
  );
};
const UserItem = React.memo(UserItemComponent);

export default function InventoryUsersScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const isOwner = activeInventory?.role === "OWNER";

  const [search, setSearch] = useState("");
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const {
    data: users,
    isLoading,
    refetch,
  } = useGetUsersByInventoryId(activeInventory?.id, activeInventory?.memberCount, "username");
  const { mutate: changeRole } = useChangeRoleInventoryUser(parseInt(activeInventory?.id));
  const { mutate: deleteUser } = useDeleteInventoryUser(parseInt(activeInventory?.id));

  const filteredUsers =
    users?.filter(
      (u) =>
        u.resultName.toLowerCase().includes(search.toLowerCase()) ||
        u.username.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  const handleEdit = useCallback((user) => {
    setSelectedUser(user);
    setEditVisible(true);
  }, []);

  const handleRemove = useCallback((user) => {
    setSelectedUser(user);
    setDeleteVisible(true);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (selectedUser) {
      deleteUser({ targetUserId: selectedUser.userId });
      setSelectedUser(null);
    }
  }, [selectedUser, deleteUser]);

  const handleConfirmRoleEdit = useCallback(
    (user, newRole) => {
      changeRole({ targetUserId: user.userId, newRole: newRole });
    },
    [changeRole],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <UserItem
        item={item}
        isOwner={isOwner}
        colors={colors}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />
    ),
    [colors, isOwner, handleEdit, handleRemove],
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

      <RefreshableFlashList
        data={filteredUsers}
        renderItem={renderItem}
        refetch={refetch}
        keyExtractor={keyExtractor}
        estimatedItemSize={72}
        contentContainerStyle={[styles.container, { paddingBottom: insets.bottom }]}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedView style={styles.empty}>
              <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
            </ThemedView>
          ) : null
        }
      />

      <RoleEditModal
        visible={editVisible}
        user={selectedUser}
        currentUserRole={activeInventory?.role}
        onClose={() => setEditVisible(false)}
        onConfirm={handleConfirmRoleEdit}
        colors={colors}
      />

      <DeleteAlert
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        description={[i18n.t("removeUserConfirmPart1"), i18n.t("removeUserConfirmPart2")]}
        deleteItem={selectedUser?.resultName}
        confirmLabel={i18n.t("remove1")}
        imageSource={`${IMAGEKIT_URL_ENDPOINT}/users/${selectedUser?.userId}/profile/profile_${selectedUser?.userId}_150x150.webp`}
        onConfirm={handleConfirmRemove}
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
  roleBadge: {
    paddingHorizontal: responsiveSize.horizontal(6),
    paddingVertical: responsiveSize.vertical(3),
    borderRadius: responsiveSize.moderate(6),
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: responsiveFont(10),
    fontWeight: "600",
  },

  empty: {
    padding: responsiveSize.moderate(15),
    alignItems: "center",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(8),
    flexShrink: 1,
  },
  actionBtns: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(8),
    marginLeft: responsiveSize.horizontal(8),
  },
  iconBtn: {
    width: responsiveSize.moderate(34),
    height: responsiveSize.moderate(34),
    borderRadius: responsiveSize.moderate(9),
    justifyContent: "center",
    alignItems: "center",
  },
});
