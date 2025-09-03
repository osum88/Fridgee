import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingLayout() {
  useLanguage();

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
     
      }}
    >
      <Stack.Screen
        name="changeLanguage"
        options={{ title: i18n.t("language") }}
      />
      <Stack.Screen name="changeTheme" options={{ title: i18n.t("theme") }} />
    </Stack>
  );
}
