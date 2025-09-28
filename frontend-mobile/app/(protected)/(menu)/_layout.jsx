import { Drawer } from "expo-router/drawer";
import { responsiveFont } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MenuLayout() {
  useLanguage();

  return (
    <Drawer
      screenOptions={{
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{ drawerItemStyle: { display: "none" }, headerShown: false }}
      />
      <Drawer.Screen
        name="(settings)"
        options={{ drawerLabel: i18n.t("setting"), headerShown: false }}
      />
    </Drawer>
  );
}
