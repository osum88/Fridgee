import { Stack, useNavigation } from "expo-router";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { Pressable, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

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
            <Pressable
              style={styles.settingIcon}
              onPress={() => navigation.openDrawer()}
            >
              <IconSymbol
                name="line.horizontal.3"
                size={responsiveSize.moderate(24)}
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

const styles = StyleSheet.create({
  settingIcon: {
    paddingRight: responsiveSize.horizontal(12),
    paddingVertical: responsiveSize.vertical(5),
  },
});
