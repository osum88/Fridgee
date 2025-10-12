import { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize, responsivePadding } from "@/utils/scale";

//vytvari "loading" než se nactou uzivatele
export function Skeleton({
  textHeight = 15,
  text1Width = 200,
  text2Width = 150,
  ...props
}) {
  const baseColor = useThemeColor().surface;
  const highlightColor = useThemeColor().surfaceGradient;

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: false,
        }),
      ])
    ).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // prechod mezi mezi baseColor a highlightColor
  const animatedBg = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [baseColor, highlightColor],
  });

  return (
    <ThemedView style={styles.userItem}>
      <Animated.View
        style={[styles.profileImage, { backgroundColor: animatedBg }]}
      />
      <ThemedView style={styles.textContainer}>
        <Animated.View
          style={[
            styles.text1,
            {
              backgroundColor: animatedBg,
              height: textHeight,
              width: text1Width,
            },
          ]}
        />
        <Animated.View
          style={[
            styles.text2,
            {
              backgroundColor: animatedBg,
              height: textHeight,
              width: text2Width,
            },
          ]}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  profileImage: {
    width: responsiveSize.moderate(57),
    height: responsiveSize.moderate(57),
    borderRadius: responsiveSize.moderate(50),
    marginEnd: 14,
  },
  userItem: {
    flexDirection: "row",
    width: "100%",
    ...responsivePadding(7),
  },
  text1: {
    borderRadius: 10,
  },
  text2: {
    borderRadius: 10,
  },
  textContainer: {
    justifyContent: "center",
    gap: responsiveSize.vertical(7),
  },
});
