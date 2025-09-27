import { router, Tabs } from "expo-router";
import { Alert, Linking, Platform } from "react-native";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/icons/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useCameraPermissions } from "expo-camera";
import i18n from "@/constants/translations";
import { IconOverlay } from "@/components/icons/IconOverlay";

export default function TabLayout() {
  const colorScheme = useThemeColor();
  const [permission, requestPermission] = useCameraPermissions();

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
        name="scannerAdd"
        options={{
          title: "Scan add",
          tabBarIcon: ({ color }) => (
            <IconOverlay
              size={responsiveSize.moderate(20)}
              icons ={["viewfinder", "plus.circle"]}
              color={color}
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
                  ]
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
