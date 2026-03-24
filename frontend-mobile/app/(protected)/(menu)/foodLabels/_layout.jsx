import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import FoodLabelsAll from "./all";
import FoodLabelsUser from "./user";
import FoodLabelsInventory from "./inventory";

const TopTab = createMaterialTopTabNavigator();

export default function FoodLabelsTab() {
  const colors = useThemeColor();

  const tabs = [i18n.t("all"), i18n.t("myLabels"), i18n.t("shared")];
  const maxLen = Math.max(...tabs.map((t) => t.length));
  const width = maxLen + 14;
  const marginLeft = (100 / tabs.length - width) / 2;

  return (
    <TopTab.Navigator
      screenOptions={{
        swipeEnabled: true,

        //TODO mozna odstranit
        // lazy: true,
        // lazyPreloadDistance: 0,
        // tabBarBounces: false,
        // pagerStyle: { overflow: "hidden" },

        tabBarActiveTintColor: colors.tabsText,
        tabBarInactiveTintColor: colors.fullName,
        tabBarIndicatorStyle: {
          backgroundColor: colors.tabsText,
          height: responsiveSize.vertical(2),
          width: width.toString() + "%",
          marginLeft: marginLeft.toString() + "%",
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
        },
        tabBarStyle: {
          backgroundColor: colors.tabsBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: Math.round(responsiveFont(14)),
          fontWeight: "700",
        },
        tabBarPressColor: colors.tabsPress,
      }}
    >
      <TopTab.Screen component={FoodLabelsAll} name="all" options={{ title: i18n.t("all") }} />
      <TopTab.Screen
        component={FoodLabelsUser}
        name="user"
        options={{ title: i18n.t("myLabels") }}
      />
      <TopTab.Screen
        component={FoodLabelsInventory}
        name="inventory"
        options={{ title: i18n.t("shared") }}
      />
    </TopTab.Navigator>
  );
}
