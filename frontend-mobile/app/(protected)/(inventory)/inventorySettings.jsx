import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { useRouter } from "expo-router";
import { responsiveSize } from "@/utils/scale";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { MenuList } from "@/components/common/MenuItem";
import { useLeaveInventory } from "@/hooks/queries/inventory/useInventoryMutation";
import { useCallback, useState } from "react";
import { useGetUsersByInventoryId } from "@/hooks/queries/inventory/useInventoryQuary";
import { DeleteAlert } from "@/components/modals/DeleteAlert";
import i18n from "@/constants/translations";
import { ThemedActivityIndicator } from "@/components/themed/ThemedActivityIndicator";

const MENU_ITEMS = [
  {
    key: "editInventory",
    icon: "pencil",
    route: "editInventory",
    color: "text",
    permissions: ["OWNER"],
  },
  {
    key: "inventoryCategories",
    icon: "folder",
    route: "inventoryCategories",
    color: "text",
    permissions: ["OWNER", "EDITOR"],
  },
  {
    key: "users",
    icon: "person",
    route: "inventoryUsers",
    color: "text",
  },
  {
    key: "inventoryNotificationSettings",
    icon: "bell",
    route: "notifications",
    color: "text",
  },
  {
    key: "inviteUser",
    icon: "person.badge.plus",
    route: "inviteUsersInventory",
    color: "text",
    permissions: ["OWNER", "EDITOR"],
  },
  {
    key: "leaveInventory",
    icon: "rectangle.portrait.and.arrow.right",
    route: "transferOwnership",
    color: "error",
  },
];

export default function InventorySettingsScreen() {
  const router = useRouter();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const [leaveVisible, setLeaveVisible] = useState(false);

  const handleNavigate = (route) => {
    router.push(`/(protected)/(inventory)/${route}`);
  };

  const { mutate: leaveInventory, isPending } = useLeaveInventory();
  const { data: users } = useGetUsersByInventoryId(
    activeInventory?.id,
    activeInventory?.memberCount,
    "username",
  );

  const shouldShowModal = activeInventory.role === "OWNER" && users?.length > 1;

  const handleLeaveInventory = useCallback(() => {
    leaveInventory({ inventoryId: activeInventory?.id });
  }, [leaveInventory, activeInventory?.id]);

  return (
    <ThemedView style={styles.container}>
      {isPending && (
        <ThemedView style={styles.overlay}>
          <ThemedActivityIndicator size={"large"} />
        </ThemedView>
      )}
      <MenuList
        items={MENU_ITEMS}
        onPress={(item) => {
          if (item?.key === "leaveInventory") {
            if (!shouldShowModal) {
              setLeaveVisible(true);
            } else {
              handleNavigate("transferOwnership");
            }
          } else {
            handleNavigate(item.route);
          }
        }}
        canShow={(item) => !item?.permissions || item?.permissions?.includes(activeInventory?.role)}
      />
      <DeleteAlert
        visible={leaveVisible}
        setVisible={setLeaveVisible}
        description={[i18n.t("leaveInventoryConfirm")]}
        deleteItem={activeInventory?.title}
        questionMark={true}
        confirmLabel={i18n.t("leave")}
        onConfirm={handleLeaveInventory}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
