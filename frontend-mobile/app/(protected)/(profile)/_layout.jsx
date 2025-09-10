import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { responsiveFont } from "@/utils/scale";

export default function Profile() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          headerShadowVisible: false,
          title: i18n.t("profile"),
          headerShown: true,
        }}
      />
    </Stack>
  );
}
