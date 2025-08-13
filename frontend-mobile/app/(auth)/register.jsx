// import { Image } from "expo-image";
import { StyleSheet } from "react-native";

// import { Collapsible } from "@/components/Collapsible";
// import { ExternalLink } from "@/components/ExternalLink";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
// import { IconSymbol } from "@/components/ui/IconSymbol";

export default function Register() {
  return (
    <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Login</ThemedText>
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
