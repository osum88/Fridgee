import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconSource = "MaterialIcons" | "MaterialCommunityIcons";

type MaterialIconsName = keyof typeof MaterialIcons.glyphMap;
type MaterialCommunityIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type IconDefinition = {
  name: MaterialIconsName | MaterialCommunityIconName;
  source: IconSource;
};

type IconMapping = Record<SymbolViewProps["name"], IconDefinition>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  //domecek
  "house.fill": { name: "home", source: "MaterialIcons" },
  "paperplane.fill": { name: "send", source: "MaterialIcons" },
  "chevron.left.forwardslash.chevron.right": {
    name: "code",
    source: "MaterialIcons",
  },
  "chevron.right": { name: "chevron-right", source: "MaterialIcons" },
  // lupa
  "magnifyingglass": { name: "search", source: "MaterialIcons" },
  // menu
  "line.horizontal.3": { name: "menu", source: "MaterialIcons" },
  // zvonek
  "bell": { name: "notifications-none", source: "MaterialIcons" },
  // nakupni kosik
  "cart": { name: "shopping-cart", source: "MaterialIcons" },
  // fajvka
  "checkmark": { name: "check", source: "MaterialIcons" },
  // oko
  "eye": { name: "visibility", source: "MaterialIcons" },
  // preskrtnute oko
  "eye.slash": { name: "visibility-off", source: "MaterialIcons" },
  // sipka doleva
  "chevron.left": { name: "arrow-back", source: "MaterialIcons" },
  // krizek
  "xmark": { name: "close", source: "MaterialIcons" },
  // dark mode
  "moon.stars": { name: "nightlight-round", source: "MaterialIcons" },
  // light mode
  "sun.max": { name: "white-balance-sunny", source: "MaterialCommunityIcons" },
  // system mode
  "circle.lefthalf.fill": {
    name: "contrast",
    source: "MaterialIcons",
  },
  // fotak outline
  "camera": { name: "camera-outline", source: "MaterialCommunityIcons" },
  // fotak
  "camera.fill": { name: "photo-camera", source: "MaterialIcons" },
  // obrazek outline
  "photo": { name: "image-outline", source: "MaterialCommunityIcons" },
  // obrazek
  "photo.fill": { name: "image", source: "MaterialCommunityIcons" },
  // kos outline
  "trash": { name: "delete-outline", source: "MaterialCommunityIcons" },
  // kos
  "trash.fill": { name: "delete", source: "MaterialCommunityIcons" },
  //baterka
  "bolt.fill": { name: "flash-on", source: "MaterialIcons" },
  //vypnuta baterka
  "bolt.slash.fill": { name: "flash-off", source: "MaterialIcons" },
  //obraceni fotaku
  "camera.rotate": { name: "camera-flip-outline", source: "MaterialCommunityIcons" },
  //ramecek skenu
  "viewfinder": { name: "scan-helper", source: "MaterialCommunityIcons" },
  //plus outline
  "plus.circle": { name: "plus-circle-outline", source: "MaterialCommunityIcons" },
  //otaznik
  "questionmark.circle": { name: "help", source: "MaterialIcons" },

} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const icon = MAPPING[name];

  if (!icon) {
    console.warn(`Icon "${name}" not found in MAPPING.`);
    return null;
  }

  switch (icon.source) {
    case "MaterialCommunityIcons":
      return (
        <MaterialCommunityIcons
          color={color}
          size={size}
          name={icon.name as MaterialCommunityIconName}
          style={style}
        />
      );
    case "MaterialIcons":
    default:
      return (
        <MaterialIcons
          color={color}
          size={size}
          name={icon.name as MaterialIconsName}
          style={style}
        />
      );
  }
}
