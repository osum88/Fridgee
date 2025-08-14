import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedLine } from "@/components/ThemedLine";
import { useLanguage } from "@/contexts/LanguageContext";
import { CheckableItem } from "../../components/common/CheckableItem";

export default function ChangeLanguage() {
  const { locale, setAppLanguage } = useLanguage();

  return (
    <ThemedView style={styles.checkableItemContainer}>
      <CheckableItem         
        label="English"
        value="en"
        selected={locale === "en"}
        onPress={setAppLanguage}/>
      <ThemedLine/>
      <CheckableItem         
        label="Čeština"
        value="cs"
        selected={locale === "cs"}
        onPress={setAppLanguage}/>
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
    }
});
