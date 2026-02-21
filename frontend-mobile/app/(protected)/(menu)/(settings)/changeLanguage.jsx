import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckableItem } from "@/components/common/CheckableItem";
import { useUpdatePreferredLanguageMutation } from "@/hooks/queries/user/useUserQuery";
import { useRef, useCallback } from "react";
import { responsiveSize, responsivePadding } from "@/utils/scale";


export default function ChangeLanguage() {
  const { locale, setAppLanguage } = useLanguage();
  const { mutate } = useUpdatePreferredLanguageMutation();

  const debounceTimeoutRef = useRef(null);

  const handleLanguageChange = useCallback((newLanguage) => {
      setAppLanguage(newLanguage);

      //vypne casovac pokud je zapnuty
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      //zapne zasovac, pokud nebude zmena, tak se jazyk nastavi v db za 1s
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
    ...responsivePadding(28),
    flex: 1,
    gap: responsiveSize.vertical(18),
  },
  
});
