import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { useRouter } from "expo-router";
import { responsiveSize } from "@/utils/scale";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { MenuList } from "@/components/common/MenuItem";

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
    route: "users",
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
    route: "leave",
    color: "error",
  },
];

export default function InventorySettingsScreen() {
  const router = useRouter();
  const activeInventory = useInventoryStore((state) => state.activeInventory);

  const handleNavigate = (route) => {
    router.push(`/(protected)/(inventory)/${route}`);
  };

  return (
    <ThemedView style={styles.container}>
      <MenuList
        items={MENU_ITEMS}
        onPress={(item) => handleNavigate(item.route)}
        canShow={(item) => !item?.permissions || item?.permissions?.includes(activeInventory?.role)}
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
});
