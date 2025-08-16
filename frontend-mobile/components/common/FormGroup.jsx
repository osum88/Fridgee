import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function FormGroup({
  label,
  placeholder,
  style,
  error,
  showError = true,
  moveAround = false,
  ...props
}) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={colorScheme === "light" && styles.text}>
        {label}
      </ThemedText>
      <ThemedView>
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
        {showError && (!moveAround || error) && <ThemedText style={{paddingLeft: 2}} type="error">{error}</ThemedText>}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 7,
  },
  text: {
    fontWeight: "600",
  },
  borderInput: {
    marginVertical: 1.7,
  },
  errorWarning: {
    borderWidth: 1.7,
  },
});
