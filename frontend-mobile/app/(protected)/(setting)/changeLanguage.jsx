import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckableItem } from "@/components/common/CheckableItem";
import { useUpdatePreferredLanguageMutation } from "@/hooks/user/useUserQuery";
import { useRef, useCallback } from "react";

export default function ChangeLanguage() {
  const { locale, setAppLanguage } = useLanguage();
  const { mutate } = useUpdatePreferredLanguageMutation();

  const debounceTimeoutRef = useRef(null);

  const handleLanguageChange = useCallback((newLanguage) => {
      setAppLanguage(newLanguage);

      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        mutate({ preferredLanguage: newLanguage });
        console.log(`Language change: ${newLanguage}`);
      }, 1000);
    },
    [mutate, setAppLanguage]
  );

  return (
    <ThemedView style={styles.checkableItemContainer}>
      <CheckableItem
        label="English"
        value="en"
        selected={locale === "en"}
        onPress={() => handleLanguageChange("en")}
      />
      <ThemedLine />
      <CheckableItem
        label="Čeština"
        value="cs"
        selected={locale === "cs"}
        onPress={() => handleLanguageChange("cs")}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  checkableItemContainer: {
    padding: 32,
    flex: 1,
    gap: 20,
  },
  itemWrapper: {
    borderBottomWidth: 0.2,
    borderBottomColor: "#3333",
  },
});
