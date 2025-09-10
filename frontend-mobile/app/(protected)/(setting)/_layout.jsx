import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { responsiveFont } from "@/utils/scale";

export default function SettingLayout() {
  useLanguage();

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        }
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
