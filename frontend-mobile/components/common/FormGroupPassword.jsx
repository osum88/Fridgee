import { StyleSheet, TouchableOpacity } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useTheme } from "@/contexts/ThemeContext";


export function FormGroupPassword({
  label,
  placeholder,
  style,
  error,
  showError = true,
  moveAround = false,
  ...props
}) {
  const { colorScheme } = useTheme();
  const currentColors = useThemeColor();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={colorScheme === "light" && styles.text}>
        {label}
      </ThemedText>
      <ThemedView>
        <ThemedView style={styles.inputContainer}>
          <ThemedTextInput
            placeholder={placeholder}
            style={[
              error && styles.errorWarning,
              !error && styles.borderInput,
              { borderColor: currentColors.error },
              style,
            ]}
            textContentType="none"
            secureTextEntry={!showPassword}
            {...props}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <IconSymbol
              size={28}
              name={showPassword ? "eye" : "eye.slash"}
              color={currentColors.input_text}
            />
          </TouchableOpacity>
        </ThemedView>
        {(!moveAround || error) && (
          <ThemedText style={{ paddingLeft: 2 }} type="error">
            {showError && error}
          </ThemedText>
        )}
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
  input: {
    paddingRight: 50,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  iconButton: {
    position: "absolute",
    right: 6,
    padding: 5,
  },
  borderInput: {
    marginVertical: 1.7,
  },
  errorWarning: {
    borderWidth: 1.7,
  },
});
