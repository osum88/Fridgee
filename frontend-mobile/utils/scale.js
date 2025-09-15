import { Platform, PixelRatio, Dimensions } from "react-native";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";

export const responsiveFont = (size, factor = 0.5) => {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;

  const scaled = moderateScale(size, factor);
  const fontScale = PixelRatio.getFontScale();

  const finalSize = scaled * fontScale;
  let maxSize = isTablet ? size + size * 0.4 : Number.MAX_SAFE_INTEGER;
  maxSize = 16 > maxSize ? finalSize : maxSize;

  return Platform.OS === "web"
    ? Math.min(finalSize || size, size + 2)
    : Math.min(finalSize || size, maxSize);
};

export const responsiveVertical = (size) => {
  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const scaled = verticalScale(size);
  const fontScale = PixelRatio.getFontScale();

  const finalSize = scaled * fontScale;
  const maxSize = isTablet ? size + size * 0.4 : Number.MAX_SAFE_INTEGER;

  return Platform.OS === "web"
    ? Math.min(finalSize || size, size + 2)
    : Math.min(finalSize || size, maxSize);
};

export const responsiveSize = {
  horizontal: (size) => {
    const { width } = Dimensions.get("window");
    const isTablet = width >= 768;
    const scaled = scale(size);
    const maxSize = isTablet ? size + size * 0.5 : Number.MAX_SAFE_INTEGER;

    return Platform.OS === "web"
      ? Math.min(scaled || size, size + size * 0.15)
      : Math.min(scaled || size, maxSize);
  },

  vertical: (size) => {
    const { width } = Dimensions.get("window");
    const isTablet = width >= 768;
    const scaled = verticalScale(size);
    const maxSize = isTablet ? size + size * 0.5 : Number.MAX_SAFE_INTEGER;
    return Platform.OS === "web"
      ? Math.min(scaled || size, size + size * 0.15)
      : Math.min(scaled || size, maxSize);
  },

  moderate: (size, factor = 0.5) => {
    const { width } = Dimensions.get("window");
    const isTablet = width >= 768;
    const scaled = moderateScale(size, factor);
    let maxSize = isTablet ? size + size * 0.4 : Number.MAX_SAFE_INTEGER;
    maxSize = 16 > maxSize ? scaled : maxSize;

    return Platform.OS === "web"
      ? Math.min(scaled || size, size + size * 0.15)
      : Math.min(scaled || size, maxSize);
  },
};

export const responsivePadding = (size) => ({
  paddingHorizontal: responsiveSize.horizontal(size),
  paddingVertical: responsiveSize.vertical(size),
});

export const responsiveMargin = (size) => ({
  marginHorizontal: responsiveSize.horizontal(size),
  marginVertical: responsiveSize.vertical(size),
});

