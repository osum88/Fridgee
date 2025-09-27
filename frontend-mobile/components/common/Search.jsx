import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";
import { responsiveSize } from "@/utils/scale";

export function Search({
  placeholder,
  value,
  onChangeText,
  transparent = false,
  ...props
}) {
  const currentColors = useThemeColor();

  return (
    <ThemedView
      style={[
        !transparent && { backgroundColor: currentColors.input },
        styles.searchInputWrapper,
      ]}
    >
      <IconSymbol
        size={responsiveSize.moderate(22)}
        name="magnifyingglass"
        color={currentColors.icon}
      />

      <ThemedTextInput
        placeholder={placeholder}
        autoCapitalize="none"
        importantForAutofill="no"
        value={value}
        onChangeText={(text) => onChangeText(text)}
        transparent={transparent}
        returnKeyType="search"
        style={[styles.search, { backgroundColor: currentColors.background }]}
        {...props}
      />

      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <IconSymbol
            size={responsiveSize.moderate(15)}
            name="xmark"
            color={currentColors.icon}
          />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: responsiveSize.horizontal(9),
    paddingVertical: responsiveSize.vertical(0.3),
    marginHorizontal: responsiveSize.horizontal(9),
  },
  search: {
    flex: 1,
  },
});
