import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { responsiveFont } from "@/utils/scale";

export default function SettingLayout() {
  useLanguage();

  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
      }}
    >
      <Stack.Screen
        name="changeLanguage"
        options={{
          title: i18n.t("language"),
          animation: "fade",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="changeTheme"
        options={{
          title: i18n.t("theme"),
          animation: "fade",
          headerShown: true,
        }}
      />
    </Stack>
  );
}
