import { Stack, useNavigation } from "expo-router";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { Pressable } from "react-native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";

export default function SettingLayout() {
  useLanguage();
  const navigation = useNavigation();
  const color = useThemeColor();

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
        name="settings"
        options={{
          title: i18n.t("settings"),
          headerLeft: () => (
            <Pressable onPress={() => navigation.openDrawer()}>
              <IconSymbol
                name="line.horizontal.3"
                size={responsiveSize.moderate(23)}
                color={color.text}
              />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="changeLanguage"
        options={{ title: i18n.t("language") }}
      />
      <Stack.Screen name="changeTheme" options={{ title: i18n.t("theme") }} />
    </Stack>
  );
}
