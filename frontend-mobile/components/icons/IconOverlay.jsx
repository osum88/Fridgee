import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";

export function IconOverlay({
  size = 22,
  color,
  icons = [],
  lightColorBackground,
  darkColorBackground,
}) {
  return (
    <ThemedView
      lightColor={lightColorBackground}
      darkColor={darkColorBackground}
      style={{ width: size, height: size }}
    >
      <IconSymbol size={size} name={icons[0]} color={color} />
      {icons[1] && (
        <IconSymbol
          size={size * 0.6}
          name={icons[1]}
          color={color}
          style={{
            position: "absolute",
            top: size * 0.2,
            left: size * 0.2,
          }}
        />
      )}
    </ThemedView>
  );
}
