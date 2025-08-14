import { TouchableOpacity, StyleSheet } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

export function CheckableItem ({ label, value, selected, onPress }) {
    const colorScheme = useColorScheme();
    const color = Colors[colorScheme ?? "light"].tint

    return(
        <TouchableOpacity style={styles.checkableItemContainer} onPress={() => onPress(value)}>
            <ThemedText type="checkableItem">{label}</ThemedText>
                {selected && (
                    <IconSymbol size={26} name="checkmark" color={color} style={styles.icon}/>
                )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    checkableItemContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        
    },
    icon: {
        fontWeight: "bold",
    },
});