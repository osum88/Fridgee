// import { Image } from "expo-image";
import { StyleSheet } from "react-native";
import i18n from "@/constants/translations";

// import { Collapsible } from "@/components/Collapsible";
// import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// import { IconSymbol } from "@/components/ui/IconSymbol";

export default function Login() {
  return (
    <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{i18n.t("login")}</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent:"center",
        gap: 8,
        height: 178,
    }
});
