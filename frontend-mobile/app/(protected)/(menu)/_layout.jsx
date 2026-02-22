import { Drawer } from "expo-router/drawer";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import MenuDrawerContent from "@/components/drawers/MenuDrawerContent";

export default function MenuLayout() {
  useLanguage();

  return (
    <Drawer
      drawerContent={(props) => <MenuDrawerContent {...props} />}
      screenOptions={{
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
        drawerStyle: {
          width: "70%",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
        drawerLabelStyle: {
          fontSize: responsiveFont(14),
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: i18n.t("inventories"),
          headerShown: false,
          drawerIconName: "archivebox.fill",
        }}
      />
      <Drawer.Screen
        name="(settings)"
        options={{
          drawerLabel: i18n.t("settings"),
          headerShown: false,
          drawerIconName: "gear",
        }}
      />
    </Drawer>
  );
}
