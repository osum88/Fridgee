import React, { memo } from "react";
import { Pressable, View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useTheme } from "@/contexts/ThemeContext";

const InventoryCardComponent = ({ item, onPress }) => {
  const color = useThemeColor();
  const { colorScheme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={() => [styles.inventoryCard, { backgroundColor: color.cardBackground }]}
    >
      <View style={styles.cardContent}>
        <IconSymbol
          name={item.icon || "refrigerator"}
          size={responsiveSize.moderate(22)}
          color={colorScheme === "light" ? item?.themeColors?.light : item?.themeColors?.dark}
        />
        <View style={styles.textContainer}>
          <ThemedText style={styles.cardText} numberOfLines={2} ellipsizeMode="tail">
            {item.title}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  inventoryCard: {
    borderRadius: responsiveSize.moderate(6),
    paddingHorizontal: responsiveSize.horizontal(14),
    paddingVertical: responsiveSize.vertical(16),
    marginVertical: responsiveSize.vertical(8),
    borderColor: "transparent",
    borderWidth: 1,
    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Android Shadow
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.moderate(12),
  },
  textContainer: {
    flex: 1,
  },
  cardText: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "700",
  },
});

export const InventoryCard = memo(InventoryCardComponent);
