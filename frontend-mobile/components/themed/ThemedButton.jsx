import { Pressable, StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ThemedText } from "@/components/themed/ThemedText";


export function ThemedButton({ style, lightColor, darkColor, titleLightColor, titleDarkColor, ...otherProps }) {
    const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "primary");
    const textColor = useThemeColor({ light: titleLightColor, dark: titleDarkColor }, "onPrimary");

    return (
        <Pressable
            style={({ pressed }) => [{ backgroundColor }, styles.btn, pressed && styles.pressed, style]} {...otherProps}
        >
            <ThemedText type="btn" style={{ color: textColor }}>
                {otherProps.children}
            </ThemedText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    btn: {
        marginVertical: 2,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    pressed: {
        opacity: 0.8,
    },
});