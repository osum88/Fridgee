import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckableItem } from "@/components/common/CheckableItem";
import { useUpdatePreferredLanguageMutation } from "@/hooks/queries/user/useUserQuery";
import { useRef, useCallback } from "react";
import { responsiveSize } from "@/utils/scale";

export default function ChangeLanguageScreen() {
  const { locale, setAppLanguage } = useLanguage();
  const { mutate } = useUpdatePreferredLanguageMutation();

  const debounceTimeoutRef = useRef(null);

  const handleLanguageChange = useCallback(
    (newLanguage) => {
      setAppLanguage(newLanguage);

      //vypne casovac pokud je zapnuty
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      //zapne zasovac, pokud nebude zmena, tak se jazyk nastavi v db za 1,5s
      debounceTimeoutRef.current = setTimeout(() => {
        mutate({ preferredLanguage: newLanguage });
      }, 1500);
    },
    [mutate, setAppLanguage],
  );

  return (
    <ThemedView style={styles.container}>
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
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
});
