import React from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import FriendsList from "./friendsList";
import FriendsRequests from "./friendsRequests";
import i18n from "@/constants/translations";

const TopTab = createMaterialTopTabNavigator();

export default function TopTabLayout() {
  const colorScheme = useThemeColor();

  const tabsCount = 2;
  const tab1Len = i18n.t("friends").length;
  const tab2Len = i18n.t("requests").length;

  const width = (tab1Len < tab2Len ? tab2Len : tab1Len) + 16;
  const marginLeft = (100 / tabsCount - width) / 2;

  return (
    <TopTab.Navigator
      // tabBar={(props) => <TopTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true,
        tabBarActiveTintColor: colorScheme.tabsText,
        tabBarInactiveTintColor: colorScheme.fullName,
        tabBarIndicatorStyle: {
          backgroundColor: colorScheme.tabsText,
          height: 3,
          width: width.toString() + "%",
          marginLeft: marginLeft.toString() + "%",
          borderTopStartRadius: 10,
          borderTopEndRadius: 10,
        },
        tabBarStyle: {
          backgroundColor: colorScheme.tabsBackground,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontSize: 16,
          fontWeight: "bold",
        },
        tabBarPressColor: colorScheme.tabsPress,
      }}
    >
      <TopTab.Screen
        component={FriendsList}
        name="friendsList"
        options={{
          title: i18n.t("friends"),
        }}
      />

      <TopTab.Screen
        component={FriendsRequests}
        name="friendsRequests"
        options={{
          title: i18n.t("requests"),
        }}
      />
    </TopTab.Navigator>
  );
}
