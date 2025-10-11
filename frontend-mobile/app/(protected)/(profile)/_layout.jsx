import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { responsiveFont } from "@/utils/scale";

export default function ProfileLayout() {
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
        name="profile"
        options={{
          title: i18n.t("profile"),
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="editProfile"
        options={{
          animation: "fade",
          // headerShadowVisible: false,
          // animationTypeForReplace:"pop",
          title: i18n.t("editProfile"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
