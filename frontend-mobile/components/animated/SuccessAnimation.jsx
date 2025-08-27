import React, { useEffect, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withDelay,
  useAnimatedStyle,
} from "react-native-reanimated";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/useThemeColor";

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const SuccessAnimation = ({ size = 120, lightColor, darkColor, checkLightColor, checkDarkColor,   ...props }) => {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "primary");
  const checkColor = useThemeColor({ light: checkLightColor, dark: checkDarkColor }, "onPrimary");

  const circleOffset = useSharedValue(314);
  const checkOffset = useSharedValue(72);
  const circleScale = useSharedValue(0.2);
  const circleOpacity = useSharedValue(0);

  const pulseScale1 = useSharedValue(1);
  const pulseOpacity1 = useSharedValue(0.5);
  const pulseBorderWidth1 = useSharedValue(0);

  const pulseScale2 = useSharedValue(1);
  const pulseOpacity2 = useSharedValue(0.5);
  const pulseBorderWidth2 = useSharedValue(0);

  const pulseScale3 = useSharedValue(1);
  const pulseOpacity3 = useSharedValue(0.5);
  const pulseBorderWidth3 = useSharedValue(0);

  const pulseScale4 = useSharedValue(1);
  const pulseOpacity4 = useSharedValue(0.5);
  const pulseBorderWidth4 = useSharedValue(0);

  const pulseCircles = useMemo(() => [
    { delay: 300, scale: pulseScale1, opacity: pulseOpacity1, borderWidth: pulseBorderWidth1 },
    { delay: 450, scale: pulseScale2, opacity: pulseOpacity2, borderWidth: pulseBorderWidth2 },
    { delay: 1100, scale: pulseScale3, opacity: pulseOpacity3, borderWidth: pulseBorderWidth3 },
    { delay: 1250, scale: pulseScale4, opacity: pulseOpacity4, borderWidth: pulseBorderWidth4 },
  ], [pulseBorderWidth1, pulseBorderWidth2, pulseBorderWidth3, pulseBorderWidth4, pulseOpacity1, pulseOpacity2, pulseOpacity3, pulseOpacity4, pulseScale1, pulseScale2, pulseScale3, pulseScale4]);

  const pulseDuration = 1000;


  useEffect(() => {
    circleOffset.value = withDelay(
      150,
      withTiming(0, { duration: 750, easing: Easing.out(Easing.ease) })
    );

    circleScale.value = withDelay(
      500,
      withTiming(1, { duration: 300, easing: Easing.bezier(0.2, 1.2, 0.2, 1) })
    );
    circleOpacity.value = withDelay(
      500,
      withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) })
    );

    checkOffset.value = withDelay(
      850,
      withTiming(0, { duration: 300, easing: Easing.bezier(0.33, 1, 0.68, 1) })
    );

    //animace pulzujicich kruhu
    pulseCircles.forEach((circle) => {
      circle.borderWidth.value = withDelay(
        circle.delay,
        withTiming(10, {
          duration: pulseDuration,
          easing: Easing.out(Easing.ease),
        })
      );
      circle.scale.value = withDelay(
        circle.delay,
        withTiming(1.2, {
          duration: pulseDuration,
          easing: Easing.out(Easing.ease),
        })
      );
      circle.opacity.value = withDelay(
        circle.delay,
        withTiming(0, {
          duration: pulseDuration,
          easing: Easing.out(Easing.ease),
        })
      );
    });
  }, [checkOffset, circleOffset, circleOpacity, circleScale, pulseCircles]);

  //propojeni s tvary
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: circleOffset.value,
  }));

  const animatedCircleFillProps = useAnimatedProps(() => ({
    transform: [
      { translateX: 60 },
      { translateY: 60 },
      { scale: circleScale.value },
      { translateX: -60 },
      { translateY: -60 },
    ],
    opacity: circleOpacity.value,
  }));

  const animatedCheckProps = useAnimatedProps(() => ({
    strokeDashoffset: checkOffset.value,
  }));

  const PulseCircle = ({ size, scale, opacity, borderWidth }) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
      borderWidth: borderWidth.value,
    }));
    return (
      <AnimatedView
        style={[
          styles.pulseRing,
          { width: size },
          { borderColor: backgroundColor },
          animatedStyle,
        ]}
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.badge, { width: size }]}>
        {pulseCircles.map((circle, index) => (
          <PulseCircle
            key={index}
            size={size}
            scale={circle.scale}
            opacity={circle.opacity}
            borderWidth={circle.borderWidth}
          />
        ))}
        <Svg viewBox="0 0 120 120" style={styles.svg}>
          <AnimatedCircle
            cx="60"
            cy="60"
            r="50"
            stroke={backgroundColor}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="314"
            animatedProps={animatedCircleProps}
          />
          <AnimatedCircle
            cx="60"
            cy="60"
            r="50"
            fill={backgroundColor}
            animatedProps={animatedCircleFillProps}
          />
          <AnimatedPath
            d="M38 62 L54 78 L84 46"
            stroke="#00000026"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="72"
            animatedProps={animatedCheckProps}
            transform="translate(1, 2)"
          />
          <AnimatedPath
            d="M38 62 L54 78 L84 46"
            stroke={checkColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            strokeDasharray="72"
            animatedProps={animatedCheckProps}
          />
        </Svg>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  badge: {
    width: 120,
    aspectRatio: 1,
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    aspectRatio: 1,
    borderRadius: 999,
    transformOrigin: "center",
    justifyContent: "center",
    alignItems: "center",
  },
});
