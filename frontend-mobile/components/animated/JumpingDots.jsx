import { Animated, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { memo, useEffect, useRef } from "react";

function JumpingDotsComponent({ type = "loading", ...otherProps }) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createAnimation = (animatedValue, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animatedValue, {
            toValue: -4,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
          }),
        ]),
      );

    const animations = [
      createAnimation(dot1, 0),
      createAnimation(dot2, 150),
      createAnimation(dot3, 300),
    ];
    animations.forEach((anim) => anim.start());

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [dot1, dot2, dot3]);

  const renderDot = (animatedValue, key) => (
    <Animated.View key={key} style={[styles.dot, { transform: [{ translateY: animatedValue }] }]}>
      <ThemedText type={type} {...otherProps}>
        {otherProps.children}
      </ThemedText>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedText type={type} style={styles.baseText} {...otherProps}></ThemedText>
      {[dot1, dot2, dot3].map((dot, index) => renderDot(dot, index))}
    </ThemedView>
  );
}

export const JumpingDots = memo(JumpingDotsComponent);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  baseText: {
    marginHorizontal: 1,
  },
  dot: {
    marginHorizontal: 1,
  },
});
