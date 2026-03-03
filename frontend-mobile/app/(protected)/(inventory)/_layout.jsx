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
      
    </Stack>
  );
}
