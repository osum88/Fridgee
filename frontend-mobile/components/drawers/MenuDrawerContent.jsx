import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { ThemedView } from "@/components/themed/ThemedView";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed/ThemedText";
import { LinearGradient } from "expo-linear-gradient";

export default function MenuDrawerContent(props) {
  const colorCurrent = useThemeColor();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        {...props}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + responsiveSize.vertical(16) }}
      >
        <LinearGradient
          colors={["#141414", "#212020"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + responsiveSize.vertical(16) }]}
        >
          <View style={styles.logoRow}>
            <ThemedText style={styles.logoText}>Fridgee</ThemedText>
            <ThemedText style={styles.logoSubtitle}>Smart inventory</ThemedText>
          </View>
        </LinearGradient>

        <View style={styles.menuSection}>
          {/* prochazi vsechny view a ziskava jejich styly */}
          {props.state.routes.map((route, index) => {
            const { drawerLabel, drawerIconName } = props.descriptors[route.key].options;

            //aktivni obrazovka
            const isFocused = props.state.index === index;
            return (
              <TouchableOpacity
                key={route.key}
                onPress={() => props.navigation.navigate(route.name)}
                activeOpacity={0.7}
                style={[
                  styles.drawerItem,
                  {
                    backgroundColor: isFocused ? colorCurrent.tintOpacity : "transparent",
                  },
                ]}
              >
                <IconSymbol
                  name={drawerIconName ?? "questionmark.circle"}
                  size={responsiveSize.moderate(21)}
                  color={isFocused ? colorCurrent.tint : "#6e6e6e"}
                />
                <ThemedText
                  style={[
                    styles.itemLabel,
                    {
                      color: isFocused ? colorCurrent.tint : colorCurrent.text,
                      fontWeight: isFocused ? "500" : "400",
                    },
                  ]}
                >
                  {drawerLabel ?? route.name}
                </ThemedText>

                {isFocused && (
                  <ThemedView
                    style={[styles.activeIndicator, { backgroundColor: colorCurrent.tint }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: responsiveSize.horizontal(16),
    paddingBottom: responsiveSize.vertical(20),
  },
  menuSection: {
    marginHorizontal: responsiveSize.horizontal(8),
    paddingTop: responsiveSize.vertical(10),
    gap: responsiveSize.horizontal(8),
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(11),
    paddingHorizontal: responsiveSize.horizontal(11),
    borderRadius: responsiveSize.moderate(8),
    gap: responsiveSize.horizontal(14),
    overflow: "hidden",
  },
  itemLabel: {
    flex: 1,
    fontSize: responsiveFont(15),
  },
  logoRow: {
    gap: responsiveSize.horizontal(8),
  },
  logoText: {
    fontSize: responsiveFont(24),
    fontWeight: "500",
    color: "#fff",
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: responsiveFont(12),
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: responsiveSize.horizontal(3.5),
  },
});
