import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { useTheme } from "@/contexts/ThemeContext";
import { useThemeColor } from "@/hooks/useThemeColor";
import { responsiveSize } from "@/utils/scale";

export function FormGroup({
  label,
  placeholder,
  style,
  error,
  showError = true,
  moveAround = false,
  ...props
}) {
  const { colorScheme } = useTheme();
  const color = useThemeColor();

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={colorScheme === "light" && styles.text}>
        {label}
      </ThemedText>
      <ThemedView>
      <ThemedView style={ { paddingBottom: responsiveSize.vertical(3)}}>
        <ThemedTextInput
          placeholder={placeholder}
          style={[
            error && styles.errorWarning,
            !error && styles.borderInput,
            { borderColor: color.error },
           
            style,
          ]}
          {...props}
        />
        </ThemedView>
        {showError && (!moveAround || error) && (
          <ThemedText
            style={{
              paddingLeft: responsiveSize.horizontal(2),
             
            }}
            type="error"
          >
            {error}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: responsiveSize.vertical(6),
  },
  text: {
    fontWeight: "600",
  },
  borderInput: {
    marginVertical: responsiveSize.vertical(1.7),
  },
  errorWarning: {
    borderWidth: 1.7,
  },
});
