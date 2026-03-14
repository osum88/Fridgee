import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

export const EmptyState = ({ icon, title, subtitle, style }) => {
  const colors = useThemeColor();

  return (
    <View style={[styles.container, style]}>
      <IconSymbol
        name={icon}
        size={responsiveSize.moderate(80)}
        color={colors.text}
        style={{ opacity: 0.2 }}
      />
      <ThemedText style={styles.title}>{title}</ThemedText>
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
    </View>
  );
};

const styles = StyleSheet.create({
 
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(40),
    marginBottom: responsiveSize.vertical(60),
  },
  title: {
    fontSize: responsiveSize.moderate(20),
    fontWeight: "600",
    marginTop: responsiveSize.vertical(20),
    textAlign: "center",
  },
  subtitle: {
    fontSize: responsiveSize.moderate(14),
    opacity: 0.6,
    marginTop: responsiveSize.vertical(10),
    textAlign: "center",
    lineHeight: responsiveSize.moderate(20),
  },
});
