import { router, Tabs, useNavigation } from "expo-router";
import { Platform, Pressable, StyleSheet } from "react-native";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/icons/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { BadgedIcon } from "@/components/icons/BadgedIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemedView } from "@/components/themed/ThemedView";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";

export default function TabLayout() {
  const colorCurrent = useThemeColor();
  const navigation = useNavigation();
  useLanguage();
  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const clearActiveInventory = useInventoryStore((state) => state.clearActiveInventory);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorCurrent.tint,
        headerShown: false,
        headerStyle: {
          height: responsiveSize.vertical(78),
        },
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        headerTitleAlign: "center",
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
            position: "absolute",
          },
          default: {},
        }),
        headerLeft: () => (
          <Pressable style={styles.menuIcon} onPress={() => navigation.openDrawer()}>
            <IconSymbol
              name="line.horizontal.3"
              size={responsiveSize.moderate(24)}
              color={colorCurrent.text}
            />
          </Pressable>
        ),
        headerRight: () => (
          <ThemedView
            style={{ flexDirection: "row", backgroundColor: colorCurrent.tabsBackground }}
          >
            {activeInventory.id && (
              <Pressable style={styles.icon} onPress={() => clearActiveInventory()}>
                <BadgedIcon
                  icons={["archivebox", "arrow.left.circle"]}
                  size={responsiveSize.moderate(26)}
                  color={colorCurrent.text}
                  lightColorBackground={colorCurrent.tabsBackground}
                  darkColorBackground={colorCurrent.tabsBackground}
                />
              </Pressable>
            )}
            <Pressable style={styles.icon} onPress={() => navigation.openDrawer()}>
              <IconSymbol
                name="bell"
                size={responsiveSize.moderate(26)}
                color={colorCurrent.text}
              />
            </Pressable>
            <Pressable
              style={[styles.icon, styles.paddingEnd]}
              onPress={() => router.push("/(protected)/(profile)/profile")}
            >
              <IconSymbol
                name="person"
                size={responsiveSize.moderate(26)}
                color={colorCurrent.text}
              />
            </Pressable>
          </ThemedView>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: activeInventory.title || i18n.t("inventories"),
          tabBarLabel: i18n.t("inventories"),
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={responsiveSize.moderate(24)} name="archivebox.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventoryHistory"
        options={{
          headerTitle: activeInventory.title || i18n.t("history"),
          tabBarLabel: i18n.t("history"),
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol
              size={responsiveSize.moderate(24)}
              name="clock.arrow.trianglehead.counterclockwise.rotate.90"
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shoppingList"
        options={{
          headerTitle: activeInventory.title || i18n.t("shoppingList"),
          tabBarLabel: i18n.t("shoppingList"),
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={responsiveSize.moderate(24)} name="cart.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <IconSymbol size={responsiveSize.moderate(22)} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  menuIcon: {
    paddingHorizontal: responsiveSize.horizontal(12),
    paddingVertical: responsiveSize.vertical(5),
  },
  icon: {
    paddingHorizontal: responsiveSize.horizontal(7),
    paddingVertical: responsiveSize.vertical(5),
  },
  paddingEnd: {
    paddingEnd: responsiveSize.horizontal(12),
  },
});
