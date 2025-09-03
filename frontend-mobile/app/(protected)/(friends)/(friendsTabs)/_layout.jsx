import React, { useState } from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { useThemeColor } from "@/hooks/useThemeColor";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import FriendsList from "./friendsList";
import FriendsRequests from "./friendsRequests";

const TopTab = createMaterialTopTabNavigator();

export default function TopTabLayout() {
  const colorScheme = useThemeColor();

  return (
    <TopTab.Navigator
      screenOptions={{
        // tabBarActiveTintColor: colorScheme.tint,
        // headerShown: true,
        // tabBarButton: HapticTab,
        // tabBarBackground: colorScheme.background,
        // tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        // tabBarIndicatorStyle: { backgroundColor: colorScheme.tint },
        tabBarActiveTintColor: colorScheme.tint, // barva aktivního tabu
        // tabBarInactiveTintColor: "#888",        // šedá pro neaktivní tab
        tabBarIndicatorStyle: { backgroundColor: colorScheme.tint }, // čára pod aktivním tabem
        // tabBarStyle: {
        //   backgroundColor: Platform.OS === "ios" ? "transparent" : "#fff", // bílá na Androidu
        //   elevation: 0,
        // },

        tabBarLabelStyle: { fontSize: 14, fontWeight: "bold" },
        tabBarStyle: {
          backgroundColor: Platform.OS === "ios" ? "transparent" : colorScheme.background,
          elevation: 0,
        },
      }}
    >
      <TopTab.Screen
        component={FriendsList}
        name="friendsList"
        options={{
          title: "Friends",
        }}
      />
      <TopTab.Screen
        component={FriendsRequests}
        name="friendsRequests"
        options={{
          title: "Requests",
        }}
      />
    </TopTab.Navigator>
  );
}
