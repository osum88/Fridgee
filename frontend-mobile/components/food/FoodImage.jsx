import { memo } from "react";
import { View, Image, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";
import { ActivityIndicator } from "react-native-paper";

const FoodImageComponent = ({ imageUrl, isLoading }) => {
  const color = useThemeColor();

  return (
    <View style={[styles.imageWrapper, { backgroundColor: color.primaryBackground }]}>
      <IconSymbol name="fork.knife" size={responsiveSize.moderate(28)} color={color.primary} />
      {imageUrl && (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.image, styles.imageAbsolute]}
          resizeMode="cover"
        />
      )}
      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator animating={true} size="small" color={color.primary} />
        </View>
      )}
    </View>
  );
};

export const FoodImage = memo(FoodImageComponent);

const styles = StyleSheet.create({
  imageWrapper: {
    width: responsiveSize.moderate(64),
    height: responsiveSize.moderate(64),
    borderRadius: responsiveSize.moderate(14),
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageAbsolute: {
    ...StyleSheet.absoluteFillObject,
  },
});
