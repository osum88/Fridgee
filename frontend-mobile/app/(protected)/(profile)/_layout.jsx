import { Stack } from "expo-router";
import i18n from "@/constants/translations";

export default function Profile() {
  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
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
