import { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { responsiveSize } from "@/utils/scale";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

const useShimmer = () => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]),
    ).start();
  }, [anim]);

  return anim;
};

const SkeletonBlock = ({
  width,
  height,
  borderRadius = 4,
  shimmerAnim,
  surface,
  surfaceGradient,
}) => {
  const bg = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [surface, surfaceGradient, surface],
  });

  return (
    <Animated.View
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: bg,
      }}
    />
  );
};

export const FoodLabelSkeleton = () => {
  const color = useThemeColor();
  const shimmerAnim = useShimmer();

  const blockProps = {
    shimmerAnim,
    surface: color.surface,
    surfaceGradient: color.surfaceGradient,
  };

  return (
    <View style={styles.itemContainer}>
      <SkeletonBlock
        width={responsiveSize.moderate(50)}
        height={responsiveSize.moderate(50)}
        borderRadius={responsiveSize.moderate(10)}
        {...blockProps}
      />

      <View style={styles.textContainer}>
        <SkeletonBlock
          width="65%"
          height={responsiveSize.vertical(16)}
          borderRadius={4}
          {...blockProps}
        />

        <SkeletonBlock
          width="45%"
          height={responsiveSize.vertical(13)}
          borderRadius={4}
          {...blockProps}
        />
      </View>
    </View>
  );
};

export const FoodLabelSkeletonList = ({ count = 8 }) => (
  <>
    {Array.from({ length: count }, (_, i) => (
      <FoodLabelSkeleton key={i} />
    ))}
  </>
);

const styles = StyleSheet.create({
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(12),
    paddingHorizontal: responsiveSize.horizontal(16),
    gap: responsiveSize.horizontal(12),
  },
  textContainer: {
    flex: 1,
    gap: responsiveSize.vertical(5),
  },
  barcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: responsiveSize.vertical(1),
  },
});
