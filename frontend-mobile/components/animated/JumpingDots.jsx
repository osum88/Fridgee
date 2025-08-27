import { Animated } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { useEffect, useRef } from "react";

export function JumpingDots({ type = "loading", ...otherProps }) {
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
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      );

    createAnimation(dot1, 0).start();
    createAnimation(dot2, 150).start();
    createAnimation(dot3, 300).start();
  }, [dot1, dot2, dot3]);

  return (
    <ThemedView style={{ flexDirection: "row", alignItems: "center" }}>
      <ThemedText type={type} style={[{ marginHorizontal: 1 }]} {...otherProps}>
        {otherProps.children}
      </ThemedText>

      <Animated.Text
       style={[{ marginHorizontal: 1 }, { transform: [{ translateY: dot1 }] }]}
        {...otherProps}
      >
        <ThemedText type={type}>.</ThemedText>
      </Animated.Text>
      <Animated.Text
       style={[{ marginHorizontal: 1 }, { transform: [{ translateY: dot2 }] }]}
        {...otherProps}
      >
        <ThemedText type={type}>.</ThemedText>
      </Animated.Text>
      <Animated.Text
        style={[{ marginHorizontal: 1 }, { transform: [{ translateY: dot3 }] }]}
        {...otherProps}
      >
        <ThemedText type={type}>.</ThemedText>
      </Animated.Text>
    </ThemedView>
  );
}

