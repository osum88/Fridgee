import React, { useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Search } from "@/components/input/Search";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { Pressable, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useSearchUsersForInventory } from "@/hooks/queries/inventory/useInventoryQuary";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import {
  responsiveFont,
  responsiveSize,
  responsivePadding,
  responsiveVertical,
} from "@/utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDebounce } from "@/hooks/debounce/useDebounce";
import i18n from "@/constants/translations";
import { Skeleton } from "@/components/animated/Skeleton";
import { useToggleInventoryInvitation } from "../../../hooks/queries/inventory/useInventoryMutation";
import { capitalizeFirst } from "@/utils/stringUtils";

// tlacitko invite/pending
const InviteButton = ({ hasPendingInvitation, onPress, colors }) => {
  const isPending = hasPendingInvitation;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: isPending ? colors.pendingButton : colors.noneButton,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <ThemedText
        style={[styles.btnText, { color: isPending ? colors.pendingTextButton : colors.onPrimary }]}
      >
        {isPending ? i18n.t("cancel") : i18n.t("invite")}
      </ThemedText>
    </Pressable>
  );
}

// item uzivatele
const UserItemComponent = ({ item, colors, onInvitePress }) => {
  return (
    <Pressable onPress={() => router.push(`/profile/${item.id}`)}>
      <ThemedView style={styles.itemContainer}>
        <ThemedView style={styles.userItem}>
          <ImageViewer
            imageUrl={`${IMAGEKIT_URL_ENDPOINT}/users/${item.id}/profile/profile_${item.id}_150x150.webp`}
            isLoading={false}
            isImagePlaceholder={true}
            imageStyle={styles.profileImage}
          />
          <ThemedView style={styles.textContainer}>
            <ThemedText style={styles.username} numberOfLines={1} ellipsizeMode="tail">
              {item.username}
            </ThemedText>
            {item.name && item.surname && (
              <ThemedText style={styles.fullName} numberOfLines={1} ellipsizeMode="tail">
                {capitalizeFirst(item.name)} {capitalizeFirst(item.surname)}
              </ThemedText>
            )}
          </ThemedView>
        </ThemedView>

        <InviteButton
          hasPendingInvitation={item.hasPendingInvitation}
          colors={colors}
          onPress={() => onInvitePress(item)}
        />
      </ThemedView>
    </Pressable>
  );
}

export const UserItem = React.memo(UserItemComponent);

export default function InviteUsersScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const { height } = useWindowDimensions();

  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(Math.ceil(height / 100));

  const debouncedSearch = useDebounce(search, 300);

  const {
    data: users,
    isLoading,
    isFetching,
  } = useSearchUsersForInventory(activeInventory.id, debouncedSearch, limit);
  const { mutate: toggleInvitation } = useToggleInventoryInvitation(activeInventory.id);

  const showSkeleton = isLoading && debouncedSearch.length > 0;

  //invituje a rusi pozvanku
  const handleInvitePress = useCallback(
    (user) => {
      toggleInvitation({ receiverId: user.id });
    },
    [toggleInvitation],
  );

  //nastavi username pri psani
  const handleChange = useCallback(
    (text) => {
      setSearch(text);
      if (limit === 50) {
        setLimit(Math.ceil(height / 100));
      }
    },
    [limit, height, setSearch],
  );

  //nastavi username pri vyhledani enterem
  const handleOnSubmitEditing = useCallback(() => {
    setLimit(50);
    setSearch(search);
  }, [search]);

  const renderItem = useCallback(
    ({ item }) => <UserItem item={item} colors={colors} onInvitePress={handleInvitePress} />,
    [colors, handleInvitePress],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <ThemedView safe={true} style={{ flex: 1 }}>
      <ThemedView style={styles.contentWrapper}>
        <ThemedView style={styles.searchContainer}>
          <TouchableOpacity
            style={{ paddingLeft: responsiveSize.horizontal(3) }}
            onPress={() => router.back()}
          >
            <IconSymbol
              size={responsiveSize.moderate(24)}
              name="chevron.left"
              color={colors.text}
            />
          </TouchableOpacity>
          <Search
            placeholder={i18n.t("searchUsername")}
            value={search}
            onChangeText={handleChange}
            onSubmitEditing={handleOnSubmitEditing}
            transparent={true}
            style={styles.search}
          />
        </ThemedView>

        <ThemedLine style={styles.line} />

        {showSkeleton ? (
          <ThemedView style={{ paddingHorizontal: responsiveSize.horizontal(9) }}>
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </ThemedView>
        ) : (
          <FlashList
            data={users ?? []}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            estimatedItemSize={72}
            contentContainerStyle={{
              paddingHorizontal: responsiveSize.horizontal(9),
              paddingBottom: insets.bottom,
            }}
            ListEmptyComponent={
              !isLoading && !isFetching && debouncedSearch.length > 0 ? (
                <ThemedView style={styles.noUsersFound}>
                  <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
                </ThemedView>
              ) : null
            }
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flex: 1,
    paddingTop: responsiveSize.vertical(13),
  },
  searchContainer: {
    paddingHorizontal: responsiveSize.horizontal(7),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
  },
  line: {
    width: "100%",
    height:
      responsiveSize.vertical(0.7) < 0.6 ? StyleSheet.hairlineWidth : responsiveSize.vertical(0.7),
    marginVertical: responsiveSize.vertical(9),
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    ...responsivePadding(7),
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: responsiveSize.moderate(57),
    height: responsiveSize.moderate(57),
    borderRadius: responsiveSize.moderate(50),
    marginEnd: responsiveSize.horizontal(12),
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  username: {
    fontSize: responsiveFont(15),
    lineHeight: responsiveVertical(19),
    fontWeight: "600",
    flexShrink: 1,
  },
  fullName: {
    fontSize: responsiveFont(12),
    opacity: 0.6,
    flexShrink: 1,
  },
  noUsersFound: {
    ...responsivePadding(15),
    alignItems: "center",
  },
  btn: {
    borderRadius: responsiveSize.moderate(9),
    minHeight: responsiveSize.vertical(28),
    minWidth: responsiveSize.horizontal(100),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(11),
    paddingVertical: responsiveSize.vertical(2),
  },
  btnText: {
    fontSize: responsiveFont(14),
    fontWeight: "500",
  },
});
