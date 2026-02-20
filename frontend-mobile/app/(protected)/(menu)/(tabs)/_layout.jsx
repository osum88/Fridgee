import { router, Tabs, useNavigation } from "expo-router";
import { Alert, Linking, Platform, Pressable, StyleSheet } from "react-native";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/icons/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCameraPermissions } from "expo-camera";
import i18n from "@/constants/translations";
import { IconOverlay } from "@/components/icons/IconOverlay";
import { BadgedIcon } from "@/components/icons/BadgedIcon";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemedView } from "@/components/themed/ThemedView";

export default function TabLayout() {
  const colorCurrent = useThemeColor();
  const [permission, requestPermission] = useCameraPermissions();
  const navigation = useNavigation();
  useLanguage();

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
          title: i18n.t("inventory"),
          headerShown: true,
          headerLeft: () => (
            <Pressable style={styles.menuIcon} onPress={() => navigation.openDrawer()}>
              <IconSymbol
                name="line.horizontal.3"
                size={responsiveSize.moderate(25)}
                color={colorCurrent.text}
              />
            </Pressable>
          ),
          headerRight: () => (
            <ThemedView
              style={{ flexDirection: "row", backgroundColor: colorCurrent.tabsBackground }}
            >
              <Pressable style={styles.icon} onPress={() => navigation.openDrawer()}>
                <BadgedIcon
                  icons={["archivebox", "arrow.left.circle"]}
                  size={responsiveSize.moderate(26)}
                  color={colorCurrent.text}
                  lightColorBackground={colorCurrent.tabsBackground}
                  darkColorBackground={colorCurrent.tabsBackground}
                />
              </Pressable>
              <Pressable style={styles.icon} onPress={() => navigation.openDrawer()}>
                <IconSymbol
                  name="bell"
                  size={responsiveSize.moderate(26)}
                  color={colorCurrent.text}
                />
              </Pressable>
              <Pressable
                style={[styles.icon, styles.paddingEnd]}
                onPress={() => router.push("../profile")}
              >
                <IconSymbol
                  name="person"
                  size={responsiveSize.moderate(26)}
                  color={colorCurrent.text}
                />
              </Pressable>
            </ThemedView>
          ),
          tabBarIcon: ({ color }) => (
            <IconSymbol size={responsiveSize.moderate(24)} name="archivebox.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scannerAdd"
        options={{
          title: i18n.t("scanAdd"),
          tabBarIcon: ({ color }) => (
            <IconOverlay
              size={responsiveSize.moderate(20)}
              icons={["viewfinder", "plus.circle"]}
              color={color}
              lightColorBackground={colorCurrent.tabsBackground}
              darkColorBackground={colorCurrent.tabsBackground}
            />
          ),
        }}
        //kontroluje jestli je povolena kamera nez to presmeruje na skener, jinak o nej pozada
        listeners={({ navigation }) => ({
          tabPress: async (e) => {
            if (!permission?.granted) {
              e.preventDefault();
              const result = await requestPermission();

              if (result.status === "granted") {
                router.push("/scannerAdd");
              } else {
                Alert.alert(
                  i18n.t("requiredPermissions"),
                  i18n.t("requiredPermissionsCameraMessage"),
                  [
                    {
                      text: i18n.t("openSettings"),
                      onPress: () => Linking.openSettings(),
                    },
                    { text: i18n.t("cancel"), style: "cancel" },
                  ],
                );
              }
            }
          },
        })}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          headerShown: true,
          headerLeft: () => (
            <Pressable style={styles.menuIcon} onPress={() => navigation.openDrawer()}>
              <IconSymbol
                name="line.horizontal.3"
                size={responsiveSize.moderate(24)}
                color={colorCurrent.text}
              />
            </Pressable>
          ),
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
