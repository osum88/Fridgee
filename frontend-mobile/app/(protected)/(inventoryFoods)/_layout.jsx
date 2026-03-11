import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { responsiveFont } from "@/utils/scale";

export default function InventoryFoodsLayout() {
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
        name="addFoodManually"
        options={{
          animation: "fade",
          title: i18n.t("addFood"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="scannerAdd"
        options={{
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="foodDetail"
        options={{
          animation: "fade",
          title: i18n.t("food"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editInstance"
        options={{
          animation: "fade",
          title: i18n.t("editItem"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="addInstance"
        options={{
          animation: "fade",
          title: i18n.t("addItem"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editFood"
        options={{
          animation: "fade",
          title: i18n.t("editFood"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
