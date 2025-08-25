import React, { useEffect } from "react";
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

export const SuccessAnimation = ({ size = 120, lightColor, darkColor, checkLightColor, checkDarkColor }) => {
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

  const pulseDelay1 = 450;
  const pulseDelay2 = 600;
  const pulseDelay3 = 1250;
  const pulseDelay4 = 1400;
  const pulseDuration = 1000;

  const pulseCircleAnimation = (delay, duration, border, scale, opacity) => {
    border.value = withDelay(
      delay,
      withTiming(10, {
        duration: duration,
        easing: Easing.out(Easing.ease),
      })
    );
    scale.value = withDelay(
      delay,
      withTiming(1.2, {
        duration: duration,
        easing: Easing.out(Easing.ease),
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration: duration,
        easing: Easing.out(Easing.ease),
      })
    );
  };

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
    pulseCircleAnimation(pulseDelay1, pulseDuration, pulseBorderWidth1, pulseScale1, pulseOpacity1);
    pulseCircleAnimation(pulseDelay2, pulseDuration, pulseBorderWidth2, pulseScale2, pulseOpacity2);
    pulseCircleAnimation(pulseDelay3, pulseDuration, pulseBorderWidth3, pulseScale3, pulseOpacity3);
    pulseCircleAnimation(pulseDelay4, pulseDuration, pulseBorderWidth4, pulseScale4, pulseOpacity4);

  }, [checkOffset, circleOffset, circleOpacity, circleScale, pulseBorderWidth1, pulseBorderWidth2, pulseBorderWidth3, pulseBorderWidth4, pulseOpacity1, pulseOpacity2, pulseOpacity3, pulseOpacity4, pulseScale1, pulseScale2, pulseScale3, pulseScale4]);

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

  const pulseStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale1.value }],
    opacity: pulseOpacity1.value,
    borderWidth: pulseBorderWidth1.value,
  }));

  const pulseStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale2.value }],
    opacity: pulseOpacity2.value,
    borderWidth: pulseBorderWidth2.value,
  }));

  const pulseStyle3 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale3.value }],
    opacity: pulseOpacity3.value,
    borderWidth: pulseBorderWidth3.value,
  }));
  
  const pulseStyle4 = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale4.value }],
    opacity: pulseOpacity4.value,
    borderWidth: pulseBorderWidth4.value,
  }));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.badge, { width: size }]}>
        <AnimatedView style={[styles.pulseRing, pulseStyle1, { width: size }, {borderColor: backgroundColor}]} />
        <AnimatedView style={[styles.pulseRing, pulseStyle2, { width: size }, {borderColor: backgroundColor}]} />
        <AnimatedView style={[styles.pulseRing, pulseStyle3, { width: size }, {borderColor: backgroundColor}]} />
        <AnimatedView style={[styles.pulseRing, pulseStyle4, { width: size }, {borderColor: backgroundColor}]} />
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
            transform="translate(0, 1)"
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
