import { Drawer } from "expo-router/drawer";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
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
        headerStyle: {
          height: responsiveSize.vertical(78),
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
        name="settings"
        options={{
          drawerLabel: i18n.t("settings"),
          title: i18n.t("settings"),
          headerShown: true,
          drawerIconName: "gearshape.fill",
          headerTitleContainerStyle: {
            paddingLeft: responsiveSize.horizontal(10),
          },
        }}
      />
      <Drawer.Screen
        name="inventoryInvitations"
        options={{
          title: i18n.t("inventoryInvitations"),
          drawerLabel: i18n.t("inventoryInvitations"),
          headerShown: true,
          drawerIconName: "envelope.badge.fill",
          headerTitleContainerStyle: {
            paddingLeft: responsiveSize.horizontal(10),
          },
        }}
      />
    </Drawer>
  );
}
