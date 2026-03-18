import { Pressable, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";
import { Fragment } from "react";
import i18n from "@/constants/translations";

function MenuItem({ item, colors, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.menuItem, pressed && { opacity: 0.6 }]}
    >
      <IconSymbol
        name={item.icon}
        size={responsiveSize.moderate(20)}
        color={colors[item.color]}
        style={styles.menuIcon}
      />
      <ThemedText style={[styles.menuLabel, { color: colors[item.color] }]}>
        {i18n.t(item.key)}
      </ThemedText>
      <IconSymbol
        name="chevron.right"
        size={responsiveSize.moderate(16)}
        color={colors[item.color] + "88"}
      />
    </Pressable>
  );
}

export function MenuList({ items, onPress, canShow }) {
  const colors = useThemeColor();

  return (
    <ThemedView>
      {items.map((item, index) =>
        !canShow || canShow(item) ? (
          <Fragment key={item.key}>
            <MenuItem item={item} colors={colors} onPress={() => onPress(item)} />
            {index < items.length - 1 && <ThemedLine />}
          </Fragment>
        ) : null,
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(19),
  },
  menuIcon: {
    marginRight: responsiveSize.horizontal(14),
  },
  menuLabel: {
    flex: 1,
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
  },
});
