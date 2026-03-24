import { Drawer } from "expo-router/drawer";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useLanguage } from "@/contexts/LanguageContext";
import MenuDrawerContent from "@/components/drawers/MenuDrawerContent";
import { useState } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { ThemedText } from "@/components/themed/ThemedText";
import Tooltip from "react-native-walkthrough-tooltip";
import { IconSymbol } from "@/components/icons/IconSymbol";

const TooltipHeader = () => {
  const colors = useThemeColor();
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <View style={styles.toolTipContainer}>
      <Tooltip
        isVisible={showTooltip}
        content={
          <ThemedText style={[styles.toolTipText, { color: colors.text }]}>
            {i18n.t("catalogInventoryTooltip")}
          </ThemedText>
        }
        placement="bottom"
        contentStyle={{ backgroundColor: colors.surface, borderRadius: 8 }}
        tooltipStyle={{
          marginTop: responsiveSize.vertical(-28),
          marginLeft: responsiveSize.horizontal(12),
        }}
        style={{ maxWidth: responsiveSize.horizontal(270) }}
        backgroundColor="rgba(0,0,0,0.2)"
        onClose={() => setShowTooltip(false)}
        showChildInTooltip={false}
      >
        <TouchableOpacity onPress={() => setShowTooltip(true)} hitSlop={styles.toolTipHitSlop}>
          <ThemedView style={{backgroundColor: colors.cardBackground}}>
            <IconSymbol size={responsiveSize.moderate(24)} name="info.circle" color={colors.text} />
          </ThemedView>
        </TouchableOpacity>
      </Tooltip>
    </View>
  );
};

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
        name="foodLabels"
        options={{
          title: i18n.t("foodCatalog"),
          drawerLabel: i18n.t("foodCatalog"),
          headerShown: true,
          headerShadowVisible: false,
          drawerIconName: "book.closed",
          headerTitleContainerStyle: {
            paddingLeft: responsiveSize.horizontal(10),
          },
          headerRight: () => <TooltipHeader />,
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
    </Drawer>
  );
}

const styles = StyleSheet.create({
  toolTipContainer: {
    paddingRight: responsiveSize.horizontal(12),
  },
  toolTipText: {
    fontSize: responsiveFont(13),
    maxWidth: responsiveSize.horizontal(270),
    lineHeight: responsiveSize.vertical(21),
  },
  toolTipHitSlop: {
    top: 15,
    bottom: 20,
    left: 15,
    right: 20,
  },
});
