import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedTextInput } from "@/components/themed/ThemedTextInput";
import { ThemedView } from "@/components/themed/ThemedView";
import { useColorScheme } from "@/hooks/useColorScheme"; 


export function FormGroup({ label, placeholder, style, ...props }) {
    const colorScheme = useColorScheme();
    return (
        <ThemedView style={styles.container}>
            <ThemedText style={colorScheme === "light" && styles.text}>{label}</ThemedText>
            <ThemedTextInput placeholder={placeholder} style={style} {...props} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 7, 
    },
    text: {
        fontWeight: "600",
    }
});