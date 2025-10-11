import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { ThemedView } from "@/components/themed/ThemedView";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed/ThemedText";

const drawerItems = [
  { key: "feedback", label: "Setting", icon: "gear", action: () => {} },
  { key: "w2ebsfite", label: "Theme", icon: "sun.max", action: () => {} },
  { key: "websgifte", label: "Camera", icon: "camera", action: () => {} },
  { key: "websfdfite", label: "Trash", icon: "trash", action: () => {} },
  { key: "webfswtite", label: "Notification", icon: "bell", action: () => {} },
  { key: "webfseidte", label: "Bolt", icon: "bolt.fill", action: () => {} },
  { key: "webshdite", label: "Home", icon: "house.fill", action: () => {} },
  { key: "websginte", label: "Buy next", icon: "cart", action: () => {} },
  { key: "webscite", label: "New eyes", icon: "eye", action: () => {} },
  {
    key: "websitdve",
    label: "New things",
    icon: "chevron.right",
    action: () => {},
  },
];

export default function MenuDrawerContent(props) {
  const colorCurrent = useThemeColor();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
        }}
      >
        <ThemedView
          style={[
            {
              paddingTop: insets.top,
              backgroundColor: colorCurrent.navigationHeader,
            },
            styles.header,
          ]}
        >
          {/* <Image
            style={{
              width: 40,
              height: 40,
              // backgroundColor: "rgba(207, 128, 37, 1)",
              //  elevation: 22,
            }}
            source={require("@/assets/images/fridgee_icon_without_background.png")}
          ></Image> */}
          <IconSymbol
            name={"refrigerator"}
            size={responsiveSize.moderate(32)}
            color={"#fff"}
            style={{
              textShadowColor: "rgba(0, 0, 0, 0.3)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 8,
            }}
          />

          <ThemedText
            style={{
              fontSize: responsiveFont(22),
              fontFamily: "Pattaya",
              color: "#fff",
              letterSpacing: 1,
              // fontWeight:"bold",

              textShadowColor: "rgba(0, 0, 0, 0.5)",
              textShadowOffset: { width: 2, height: 2 },
              textShadowRadius: 8,
              // textShadowColor: "rgba(0, 0, 0, 0.5)",
              // textShadowOffset: { width: 0, height: 0 },
              // textShadowRadius: 10,
            }}
          >
            Fridgee{"  "}
          </ThemedText>
        </ThemedView>

        {/* prochazi vsechny view a ziskava jejich styly */}
        {props.state.routes.map((route, index) => {
        const {
          drawerLabel,
          drawerIconName,
          drawerItemStyle,
          drawerLabelStyle,
        } = props.descriptors[route.key].options;

        //aktivni obrazovka
        const isFocused = props.state.index === index;

        {/* ----------------------smazat mocup---------------------------- */}
        {/* {drawerItems.map((route, index) => {
          const isFocused = route.label === "Theme";

          const drawerIconName = route.icon;
          const drawerLabel = route.label; */}

          {
            /* ------------------------------------------------------------------ */
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => props.navigation.navigate(route.name)}
              style={styles.drawerItem}
            >
              <ThemedView
                style={[
                  // drawerItemStyle,

                  styles.itemContent,
                  {
                    backgroundColor: isFocused
                      ? colorCurrent.tintOpacity
                      : "transparent",
                  },
                ]}
              >
                <IconSymbol
                  name={drawerIconName ?? "questionmark.circle"}
                  size={responsiveSize.moderate(24.5)}
                  color={isFocused ? colorCurrent.tint : "#656565"}
                />
                <ThemedText
                  style={[
                    // drawerLabelStyle,
                    styles.itemLabel,
                    isFocused && styles.itemLabelActive,
                    {
                      color: isFocused ? colorCurrent.tint : colorCurrent.text,
                    },
                  ]}
                >
                  {drawerLabel ?? route.name}
                </ThemedText>
              </ThemedView>
              {isFocused && (
                <ThemedView
                  style={[
                    styles.activeIndicator,
                    { backgroundColor: colorCurrent.tint },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    width: "100%",
    minHeight: responsiveSize.vertical(90),
    marginBottom: responsiveSize.vertical(12),
    paddingLeft: responsiveSize.horizontal(17),
    flexDirection: "row",
    gap: responsiveSize.horizontal(8),
  },
  drawerItem: {
    marginHorizontal: responsiveSize.horizontal(6),
    marginVertical: responsiveSize.vertical(3),
    borderRadius: responsiveSize.moderate(6),
    overflow: "hidden",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(8),
    paddingHorizontal: responsiveSize.horizontal(11),
  },
  itemLabel: {
    marginLeft: responsiveSize.vertical(14),
    fontSize: responsiveFont(15),
    fontWeight: "500",
  },
  itemLabelActive: {
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: responsiveSize.horizontal(3.5),
  },
});
