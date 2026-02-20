import React from "react";
import { View, StyleSheet } from "react-native";
import { HelperText } from "react-native-paper";
import { responsiveSize } from "@/utils/scale";
import { ThemedView } from "@/components/themed/ThemedView";


export const DoubleInputRow = ({
  leftComponent,
  rightComponent,
  ratio = [1, 1],
  gap = 6,
  error, 
  inputColor,
}) => {
  return (
    <ThemedView style={styles.outerContainer}>
      <ThemedView style={[styles.row, { gap: responsiveSize.horizontal(gap) }]}>
        <View style={{ flex: ratio[0] }}>{leftComponent}</View>
        <View style={{ flex: ratio[1] }}>{rightComponent}</View>
      </ThemedView>

      <HelperText type="error" visible={!!error} style={styles.helper} theme={inputColor}>
        {error}
      </HelperText>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    width: "100%",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  helper: {
    marginLeft: responsiveSize.horizontal(-9),
    marginTop: responsiveSize.vertical(-2), 
  },
});
