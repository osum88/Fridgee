import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useTheme } from "@/contexts/ThemeContext";

export const InventorySkeleton = () => {
  const color = useThemeColor();
  const { colorScheme } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [shimmerAnim]);

  const animatedBg = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color.surface, color.surfaceGradient],
  });

  return (
    <View
      style={[
        styles.inventoryCard,
        { backgroundColor: colorScheme === "light" ? color.background : color.surface },
      ]}
    >
      <View style={styles.cardContent}>
        {/* Kruh pro ikonu */}
        <Animated.View style={[styles.iconSkeleton, { backgroundColor: animatedBg }]} />
        <View style={styles.textContainer}>
          {/* Pruh pro text (title) */}
          <Animated.View style={[styles.titleSkeleton, { backgroundColor: animatedBg }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inventoryCard: {
    borderRadius: responsiveSize.moderate(12),
    paddingHorizontal: responsiveSize.horizontal(14),
    paddingVertical: responsiveSize.vertical(16),
    marginVertical: responsiveSize.vertical(8),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.moderate(12),
  },
  iconSkeleton: {
    width: responsiveSize.moderate(24),
    height: responsiveSize.moderate(24),
    borderRadius: responsiveSize.moderate(11),
  },
  textContainer: {
    flex: 1,
  },
  titleSkeleton: {
    height: responsiveSize.moderate(16),
    width: "70%",
    borderRadius: responsiveSize.moderate(4),
  },
});
