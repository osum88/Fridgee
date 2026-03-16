import { StyleSheet, Pressable } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useRouter } from "expo-router";
import i18n from "@/constants/translations";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { Fragment } from "react";

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
    route: "invite",
    color: "text",
    permissions: ["OWNER"],
  },
  {
    key: "leaveInventory",
    icon: "rectangle.portrait.and.arrow.right",
    route: "leave",
    color: "error",
  },
];

function MenuItem({ item, colors, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
    >
      <IconSymbol
        name={item.icon}
        size={responsiveSize.moderate(20)}
        color={colors[item.color]}
        style={styles.menuIcon}
      />
      <ThemedText style={[styles.menuLabel, { color: colors[item.color] }]}>
        {i18n.t(item.key)}
      </ThemedText>
      <IconSymbol
        name="chevron.right"
        size={responsiveSize.moderate(16)}
        color={colors[item.color] + "88"}
      />
    </Pressable>
  );
}

export default function InventorySettingsScreen() {
  const colors = useThemeColor();
  const router = useRouter();
  const activeInventory = useInventoryStore((state) => state.activeInventory);

  const handleNavigate = (route) => {
    router.push(`/(protected)/(inventory)/${route}`);
  };

  return (
    <ThemedView style={styles.container}>
      {MENU_ITEMS.map(
        (item, index) =>
          (!item?.permissions || item?.permissions?.includes(activeInventory?.role)) && (
            <Fragment key={item.key}>
              <MenuItem item={item} colors={colors} onPress={() => handleNavigate(item.route)} />
              {index < MENU_ITEMS.length - 1 && <ThemedLine />}
            </Fragment>
          ),
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(17),
  },
  menuIcon: {
    marginRight: responsiveSize.horizontal(14),
  },
  menuLabel: {
    flex: 1,
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
  },
});
