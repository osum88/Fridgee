import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { useThemeColor } from "@/hooks/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export default function MenuDrawerContent(props) {
  const colorCurrent = useThemeColor();

  return (
    <DrawerContentScrollView {...props}>
      {/* prochazi vsechny view a ziskava jejich styly */}
      {props.state.routes.map((route, index) => {
        const {
          drawerLabel,
          drawerIconName,
          drawerItemStyle,
          drawerLabelStyle,
        } = props.descriptors[route.key].options;

        //aktivni obrazovka
        const isFocused = props.state.index === index;

        return (
          <DrawerItem
            key={route.key}
            label={drawerLabel ?? route.name}
            icon={({ size, color }) => (
              <IconSymbol
                name={drawerIconName ?? "questionmark.circle"}
                size={size}
                color={isFocused ? colorCurrent.tint : color}
              />
            )}
            focused={isFocused}
            onPress={() => props.navigation.navigate(route.name)}
            style={[
              drawerItemStyle,
              {
                backgroundColor: isFocused
                  ? colorCurrent.tintOpacity
                  : "transparent",
                borderRadius: responsiveSize.moderate(6),
              },
            ]}
            labelStyle={[
              drawerLabelStyle,
              isFocused && { color: colorCurrent.tint },
            ]}
          />
        );
      })}
    </DrawerContentScrollView>
  );
}
