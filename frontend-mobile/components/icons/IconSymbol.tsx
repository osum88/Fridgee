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
  "chevron.left.forwardslash.chevron.right": { name: "code", source: "MaterialIcons" },
  "chevron.right": { name: "chevron-right", source: "MaterialIcons" },
  // lupa
  magnifyingglass: { name: "search", source: "MaterialIcons" },
  // menu
  "line.horizontal.3": { name: "menu", source: "MaterialIcons" },
  // zvonek
  bell: { name: "notifications-none", source: "MaterialIcons" },
  // nakupni kosik
  "cart.fill": { name: "cart", source: "MaterialCommunityIcons" },
  // nakupni kosik outline
  "cart": { name: "cart-outline", source: "MaterialCommunityIcons" },
  // fajvka
  checkmark: { name: "check", source: "MaterialIcons" },
  // oko
  eye: { name: "visibility", source: "MaterialIcons" },
  // preskrtnute oko
  "eye.slash": { name: "visibility-off", source: "MaterialIcons" },
  // sipka doleva
  "chevron.left": { name: "arrow-back", source: "MaterialIcons" },
  // krizek
  xmark: { name: "close", source: "MaterialIcons" },
  // dark mode
  "moon.stars": { name: "nightlight-round", source: "MaterialIcons" },
  // light mode
  "sun.max": { name: "white-balance-sunny", source: "MaterialCommunityIcons" },
  // system mode
  "circle.lefthalf.fill": { name: "contrast", source: "MaterialIcons" },
  // fotak outline
  camera: { name: "camera-outline", source: "MaterialCommunityIcons" },
  // fotak
  "camera.fill": { name: "photo-camera", source: "MaterialIcons" },
  // obrazek outline
  photo: { name: "image-outline", source: "MaterialCommunityIcons" },
  // obrazek
  "photo.fill": { name: "image", source: "MaterialCommunityIcons" },
  // kos outline
  trash: { name: "delete-outline", source: "MaterialCommunityIcons" },
  // kos
  "trash.fill": { name: "delete", source: "MaterialCommunityIcons" },
  //baterka
  "bolt.fill": { name: "flash-on", source: "MaterialIcons" },
  //vypnuta baterka
  "bolt.slash.fill": { name: "flash-off", source: "MaterialIcons" },
  //obraceni fotaku
  "camera.rotate": { name: "camera-flip-outline", source: "MaterialCommunityIcons" },
  //ramecek skenu
  viewfinder: { name: "scan-helper", source: "MaterialCommunityIcons" },
  //plus outline
  "plus.circle": { name: "plus-circle-outline", source: "MaterialCommunityIcons" },
  //otaznik
  "questionmark.circle": { name: "help", source: "MaterialIcons" },
  //setting
  "gearshape.fill": { name: "settings", source: "MaterialIcons" },
  //setting outline
  "gearshape": { name: "cog-outline", source: "MaterialCommunityIcons" },
  //lednice
  refrigerator: { name: "fridge", source: "MaterialCommunityIcons" },
  //email
  envelope: { name: "email-outline", source: "MaterialCommunityIcons" },
  //banka
  "building.columns": { name: "bank-outline", source: "MaterialCommunityIcons" },
  //dort
  "birthday.cake": { name: "cake-variant-outline", source: "MaterialCommunityIcons" },
  //kalendar
  calendar: { name: "calendar-outline", source: "MaterialCommunityIcons" },
  //admin
  "checkmark.shield": {
    name: "badge-account-horizontal-outline",
    source: "MaterialCommunityIcons",
  },
  //osoba
  person: { name: "account-outline", source: "MaterialCommunityIcons" },
  //gender
  "person.crop.square": { name: "human-male", source: "MaterialCommunityIcons" },
  //sipka dolu
  "chevron.down": { name: "chevron-down", source: "MaterialCommunityIcons" },
  //sipka nahoru
  "chevron.up": { name: "chevron-up", source: "MaterialCommunityIcons" },
  //info
  "info.circle": { name: "information-outline", source: "MaterialCommunityIcons" },
  //info vyplnene
  "info.circle.fill": { name: "information", source: "MaterialCommunityIcons" },
  //inventare
  "archivebox.fill": { name: "archive", source: "MaterialCommunityIcons" },
  //sipka v kruhu outline
  "arrow.left.circle": { name: "arrow-left-thin", source: "MaterialCommunityIcons" },
  //inventare outline
  archivebox: { name: "archive-outline", source: "MaterialCommunityIcons" },
  //globus
  globe: { name: "earth", source: "MaterialCommunityIcons" },
  //plus
  plus: { name: "plus", source: "MaterialCommunityIcons" },
  //minus
  minus: { name: "minus", source: "MaterialCommunityIcons" },
  // tuzka
  pencil: { name: "lead-pencil", source: "MaterialCommunityIcons" },
  //sipka v levo
  "arrow.left": { name: "arrow-left", source: "MaterialCommunityIcons" },
  //barcode
  barcode: { name: "barcode", source: "MaterialCommunityIcons" },
  //sipka v pravo
  "arrow.right": { name: "arrow-right", source: "MaterialCommunityIcons" },
  //barcode-scan
  "barcode.viewfinder": { name: "barcode-scan", source: "MaterialCommunityIcons" },
  //kniha
  "book.fill": { name: "book-open-variant", source: "MaterialCommunityIcons" },
  //zvedla ruka
  "hand.raised.fill": { name: "hand-back-right", source: "MaterialCommunityIcons" },
  //palec nahoru
  "hand.thumbsup.fill": { name: "thumb-up", source: "MaterialCommunityIcons" },
  //srdce
  "heart.fill": { name: "cards-heart", source: "MaterialCommunityIcons" },
  //termostat minus
  "thermometer.snowflake": { name: "thermometer-minus", source: "MaterialCommunityIcons" },
  //vlocka
  snow: { name: "snowflake", source: "MaterialCommunityIcons" },
  //taska
  "bag.fill": { name: "bag-personal", source: "MaterialCommunityIcons" },
  //kladivo
  "hammer.fill": { name: "hammer", source: "MaterialCommunityIcons" },
  //plamen
  "flame.fill": { name: "fire", source: "MaterialCommunityIcons" },
  //darek
  "gift.fill": { name: "gift", source: "MaterialCommunityIcons" },
  //auto
  "car.fill": { name: "car", source: "MaterialCommunityIcons" },
  //destnik
  "umbrella.fill": { name: "umbrella", source: "MaterialCommunityIcons" },
  //kolo
  "bicycle": { name: "bicycle", source: "MaterialCommunityIcons" },
  // kosik
  "basket.fill": { name: "basket", source: "MaterialCommunityIcons" },
  // kosik outline
  "basket": { name: "basket-outline", source: "MaterialCommunityIcons" },
  //postel
  "bed.double.fill": { name: "bed-double", source: "MaterialCommunityIcons" },
  //mrkev
  "carrot.fill": { name: "carrot", source: "MaterialCommunityIcons" },
  //mikrovlnka
  "microwave.fill": { name: "microwave", source: "MaterialCommunityIcons" },
  //hrnek
  "mug.fill": { name: "glass-mug", source: "MaterialCommunityIcons" },
  //pec
  "oven.fill": { name: "toaster-oven", source: "MaterialCommunityIcons" },
  //popcorn
  "popcorn.fill": { name: "popcorn", source: "MaterialCommunityIcons" },
  //gauc
  "sofa.fill": { name: "sofa-single", source: "MaterialCommunityIcons" },
  //stul
  "table.furniture.fill": { name: "table-furniture", source: "MaterialCommunityIcons" },
  //stan
  "tent.fill": { name: "tent", source: "MaterialCommunityIcons" },
  //penezenka
  "wallet.bifold.fill": { name: "wallet", source: "MaterialCommunityIcons" },
  //medved
  "teddybear.fill": { name: "teddy-bear", source: "MaterialCommunityIcons" },
  //boty
  "shoe.fill": { name: "shoe-sneaker", source: "MaterialCommunityIcons" },
  //basketovy mic
  "basketball.fill": { name: "basketball", source: "MaterialCommunityIcons" },
  //sluchatka
  "beats.headphones": { name: "headphones", source: "MaterialCommunityIcons" },
  //schody
  stairs: { name: "stairs", source: "MaterialCommunityIcons" },
  //svetlo
  "lightbulb.fill": { name: "lightbulb", source: "MaterialCommunityIcons" },
  //pes
  "dog.fill": { name: "dog", source: "MaterialCommunityIcons" },
  //kosik s plus
  "cart.badge.plus": { name: "cart-plus", source: "MaterialCommunityIcons" },
  //vidlicka a nuz
  "fork.knife": { name: "silverware-variant", source: "MaterialCommunityIcons" },
  //kategorie
  "list.bullet": { name: "format-list-bulleted", source: "MaterialCommunityIcons" },
  //fajfka s koleckem
  "checkmark.circle": { name: "check-circle-outline", source: "MaterialCommunityIcons" },
  //historie
  "clock.arrow.trianglehead.counterclockwise.rotate.90": { name: "history", source: "MaterialCommunityIcons" },
  // vrstvy
  "square.3.layers.3d": { name: "layers-outline", source: "MaterialCommunityIcons" },
  //filtry
  "line.3.horizontal.decrease": { name: "filter-variant", source: "MaterialCommunityIcons" },
  //3 tecky
  "ellipsis": { name: "dots-horizontal", source: "MaterialCommunityIcons" },
  //3 kateforie
  "folder": { name: "folder-outline", source: "MaterialCommunityIcons" },
  // pridat uzivatele
  "person.badge.plus": { name: "account-plus-outline", source: "MaterialCommunityIcons" },
  // opustit inventar
  "rectangle.portrait.and.arrow.right": { name: "exit-to-app", source: "MaterialCommunityIcons" },
  // pozvanky do invenatre
  "envelope.badge.fill": { name: "email-plus", source: "MaterialCommunityIcons" },
  // pozvanky do invenatre
  "smallcircle.fill.circle": { name: "circle-small", source: "MaterialCommunityIcons" },
  // katalogy
  "book.closed": { name: "book-open-variant", source: "MaterialCommunityIcons" },
  // dollar
  "dollarsign": { name: "attach-money", source: "MaterialIcons" },
  // vaha
  "scalemass": { name: "scale-balance", source: "MaterialCommunityIcons" },

  //coat.fill
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
