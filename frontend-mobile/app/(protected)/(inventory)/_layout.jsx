import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { responsiveFont } from "@/utils/scale";

export default function InventoryLayout() {
  return (
    <Stack
      detachInactiveScreens={false}
      screenOptions={{
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
      }}
    >
      <Stack.Screen
        name="addInventory"
        options={{
          animation: "fade",
          title: i18n.t("addInventory"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="inventorySettings"
        options={{
          animation: "fade",
          title: i18n.t("inventorySettings"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editInventory"
        options={{
          animation: "fade",
          title: i18n.t("editingInventory"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="inventoryCategories"
        options={{
          animation: "fade",
          title: i18n.t("inventoryCategories"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="inviteUsersInventory"
        options={{
          animation: "fade",
          title: i18n.t("inviteUser"),
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="inventoryUsers"
        options={{
          animation: "fade",
          title: i18n.t("users"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="transferOwnership"
        options={{
          animation: "fade",
          title: i18n.t("transferOwnership"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
