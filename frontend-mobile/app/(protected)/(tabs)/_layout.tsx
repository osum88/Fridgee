import { Tabs } from "expo-router";
import React, { useState } from "react";
import { Platform } from "react-native";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/useThemeColor";


export default function TabLayout() {
  const colorScheme = useThemeColor();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme.tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        },
        tabBarItemStyle: {
          height: responsiveSize.vertical(70),
        },
        tabBarLabelStyle: {
          fontSize: responsiveFont(9),
          flexWrap: "wrap",
        },
        tabBarLabelPosition: "below-icon",
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: true,

          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={responsiveSize.moderate(23)}
              name="house.fill"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={responsiveSize.moderate(22)}
              name="paperplane.fill"
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
