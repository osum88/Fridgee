import React, { useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { Search } from "@/components/input/Search";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { Pressable, StyleSheet, View } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { ImageViewer } from "@/components/image/ImageViewer";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { responsiveFont, responsiveSize, responsiveVertical } from "@/utils/scale";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import i18n from "@/constants/translations";
import { useGetInventoryInvitations } from "@/hooks/queries/inventory/useInventoryQuary";
import { capitalizeFirst, getRelativeTime } from "@/utils/stringUtils";
import {
  useAcceptInventoryInvitation,
  useRejectInventoryInvitation,
} from "@/hooks/queries/inventory/useInventoryMutation";
import { DeleteAlert } from "@/components/modals/DeleteAlert";

// accept/decline tlacitka
const InvitationActionButton = ({ onAccept, onDecline, colors }) => {
  return (
    <View style={styles.actionButtons}>
      <Pressable
        onPress={onDecline}
        style={({ pressed }) => [
          styles.actionBtn,
          { backgroundColor: colors.errorBackground, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <IconSymbol name="xmark" size={responsiveSize.moderate(17)} color={colors.error} />
      </Pressable>
      <Pressable
        onPress={onAccept}
        style={({ pressed }) => [
          styles.actionBtn,
          { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
        ]}
      >
        <IconSymbol name="checkmark" size={responsiveSize.moderate(17)} color={colors.onPrimary} />
      </Pressable>
    </View>
  );
};

// item pozvanky
const InvitationItemComponent = ({ item, colors, onAccept, onDecline }) => {
  return (
    <ThemedView style={styles.itemContainer}>
      <ThemedView style={styles.userItem}>
        <ImageViewer
          imageUrl={`${IMAGEKIT_URL_ENDPOINT}/users/${item.senderId}/profile/profile_${item.senderId}_150x150.webp`}
          isLoading={false}
          isImagePlaceholder={true}
          imageStyle={[styles.profileImage]}
        />
        <ThemedView style={styles.textContainer}>
          <ThemedText style={styles.invitationText} numberOfLines={3} ellipsizeMode="tail">
            <ThemedText style={[styles.username, { color: colors.text }]}>
              {item.senderUsername}
            </ThemedText>{" "}
            {i18n.t("inventoryInvitationText")}{" "}
            <ThemedText style={[styles.inventoryTitle, { color: colors.text }]}>
              {capitalizeFirst(item.inventoryTitle)}
            </ThemedText>
            {". "}
            <ThemedText style={[styles.timeText, { color: colors.text + "75" }]} numberOfLines={1}>
              {getRelativeTime(item.createdAt).replace(/ /g, "\u00A0")}
            </ThemedText>
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <InvitationActionButton
        colors={colors}
        onAccept={() => onAccept(item)}
        onDecline={() => onDecline(item)}
      />
    </ThemedView>
  );
};

const InvitationItem = React.memo(InvitationItemComponent);

export default function InventoryInvitationsScreen() {
  const colors = useThemeColor();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const { data: invitations, isLoading } = useGetInventoryInvitations();
  const { mutate: acceptInvitation } = useAcceptInventoryInvitation();
  const { mutate: rejectInvitation } = useRejectInventoryInvitation();

  // filtrovani podle searche
  const filteredInvitations =
    invitations?.filter(
      (inv) =>
        inv.inventoryTitle.toLowerCase().includes(search.toLowerCase()) ||
        inv.senderUsername.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  //potvrdi zadost
  const handleAccept = useCallback(
    (item) => {
      acceptInvitation({ invitationId: item.id });
    },
    [acceptInvitation],
  );

  //odmitne zadost
  const handleDecline = useCallback((item) => {
    setSelectedInvitation(item);
    setDeleteVisible(true);
  }, []);

  //potvrdi odmitnuti zadosti
  const handleConfirmDecline = useCallback(() => {
    if (selectedInvitation) {
      rejectInvitation({ invitationId: selectedInvitation.id });
    }
  }, [selectedInvitation, rejectInvitation]);

  const renderItem = useCallback(
    ({ item }) => (
      <InvitationItem
        item={item}
        colors={colors}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    ),
    [colors, handleAccept, handleDecline],
  );

  const keyExtractor = useCallback((item) => String(item.id), []);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedView style={[styles.searchContainer, styles.container]}>
        <Search
          placeholder={i18n.t("searchInvitations")}
          value={search}
          onChangeText={setSearch}
          style={styles.search}
          outlineStyle={{ marginHorizontal: 0 }}
        />
      </ThemedView>

      <FlashList
        data={filteredInvitations}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={72}
        contentContainerStyle={[
          styles.container,
          {
            paddingBottom: insets.bottom,
          },
        ]}
        ListEmptyComponent={
          !isLoading ? (
            <ThemedView style={styles.noInvitations}>
              <ThemedText>{i18n.t("noInvitations")}</ThemedText>
            </ThemedView>
          ) : null
        }
      />
      <DeleteAlert
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        description={[i18n.t("declineInventoryInvitationConfirm")]}
        deleteItem={`„${selectedInvitation?.inventoryTitle}“`}
        questionMark={true}
        confirmLabel={i18n.t("reject")}
        onConfirm={handleConfirmDecline}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(14),
  },
  searchContainer: {
    paddingBottom: responsiveSize.vertical(16),
    paddingTop: responsiveSize.vertical(12),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    paddingVertical: responsiveSize.vertical(10),
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: responsiveSize.vertical(16),
  },

  userItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: responsiveSize.moderate(50),
    height: responsiveSize.moderate(50),
    borderRadius: responsiveSize.moderate(25),
    marginEnd: responsiveSize.horizontal(12),
    borderWidth: 0,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  invitationText: {
    fontSize: responsiveFont(13),
    lineHeight: responsiveVertical(15),
    flexShrink: 1,
  },
  username: {
    fontWeight: "500",
    fontSize: responsiveFont(13),
  },
  timeText: {
    fontSize: responsiveFont(12),
    marginTop: responsiveSize.vertical(3),
  },
  inventoryTitle: {
    fontWeight: "500",
    fontSize: responsiveFont(13),
  },
  noInvitations: {
    padding: responsiveSize.moderate(15),
    alignItems: "center",
  },
  actionButtons: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(13),
    marginLeft: responsiveSize.horizontal(2),
  },
  actionBtn: {
    width: responsiveSize.moderate(37),
    height: responsiveSize.moderate(37),
    borderRadius: responsiveSize.moderate(12),
    justifyContent: "center",
    alignItems: "center",
  },
});
