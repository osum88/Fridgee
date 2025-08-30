import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useThemeColor } from "@/hooks/useThemeColor";


export function Search({ placeholder, value, onChangeText, transparent = false, ...props }) {
  const currentColors = useThemeColor();

  return (
    <ThemedView
      style={[
        !transparent && { backgroundColor: currentColors.input },
        styles.searchInputWrapper,
      ]}
    >
      <IconSymbol size={24} name="magnifyingglass" color={currentColors.icon} />

      <ThemedTextInput
        placeholder={placeholder}
        autoCapitalize="none"
        importantForAutofill="no"
        value={value}
        onChangeText={(text) => onChangeText(text)}
        transparent={transparent}
        returnKeyType="search"
        style={[
          styles.search,
          { backgroundColor: currentColors.backgroundColor },
        ]}
        {...props}
      />

      {value?.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <IconSymbol size={16} name="xmark" color={currentColors.icon} />
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
    paddingHorizontal: 10,
    marginHorizontal: 10,
  },
  search: {
    flex: 1,
    fontSize: 16,
  },
});
