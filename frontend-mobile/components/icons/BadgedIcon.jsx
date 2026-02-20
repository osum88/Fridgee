import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";

export function BadgedIcon({
  size = 22,
  color,
  icons = [],
  lightColorBackground,
  darkColorBackground,
}) {
  const badgeSize = size * 0.6; 
  const badgeContainerSize = badgeSize * 1.1;
  return (
    <ThemedView
      lightColor={lightColorBackground}
      darkColor={darkColorBackground}
      style={{ width: size, height: size }}
    >
      <IconSymbol size={size} name={icons[0]} color={color} />
      {icons[1] && (
        <ThemedView
          lightColor={lightColorBackground}
          darkColor={darkColorBackground}
          style={{
            position: "absolute",
            width: badgeContainerSize,
            height: badgeContainerSize,
            borderRadius: badgeContainerSize / 2,
            bottom: -size * 0.2,
            right: -size * 0.2,
          }}
        >
          <IconSymbol size={badgeSize} name={icons[1]} color={color} />
        </ThemedView>
      )}
    </ThemedView>
  );
}
