import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  useAnimatedReaction,
  cancelAnimation,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { memo, useEffect } from "react";

//cara skeneru
function ScannerLineComponent({ top, height, left, width, paused }) {
  //vertikalni pozice cary
  const translateY = useSharedValue(top);
  //vyska horniho gradientu
  const translateHeightUp = useSharedValue(height);
  //vyska dolniho gradientu
  const translateHeightDown = useSharedValue(height);
  //smer gradientu
  const direction = useSharedValue(false);

  //zapne animaci
  useEffect(() => {
    if (!paused) {
      //cara
      translateY.value = withRepeat(
        withTiming(top + height - 4, {
          duration: 2000,
          easing: Easing.inOut(Easing.quad),
        }),
        -1, //opakuje se nekonecne
        true, //reverzni smer
      );
      //horni gradient
      translateHeightUp.value = withRepeat(
        withTiming(0, {
          duration: 2000,
          easing: Easing.poly(10),
        }),
        -1, //opakuje se nekonecne
        true, //reverzni smer
      );
      //dolni gradient
      translateHeightDown.value = withRepeat(
        withTiming(0, {
          duration: 2000,
          easing: Easing.poly(10),
        }),
        -1, //opakuje se nekonecne
        false,
      );
    } else {
      // Zastavení animací při pauze
      cancelAnimation(translateY);
      cancelAnimation(translateHeightUp);
      cancelAnimation(translateHeightDown);
    }

    return () => {
      // Cleanup při unmountu komponenty
      cancelAnimation(translateY);
      cancelAnimation(translateHeightUp);
      cancelAnimation(translateHeightDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, height, paused]);

  //prepina smer gradientu
  useAnimatedReaction(
    () => translateY.value,
    (currentY, previousY) => {
      direction.value = currentY > previousY;
    },
  );

  //posouva caru
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  //pososouva horni gradient
  const upGradientStyle = useAnimatedStyle(() => {
    const maxHeight = translateY.value - top;
    const safeHeight = Math.max(Math.min(translateHeightUp.value, maxHeight), 1);
    const visible = direction.value ? 1 : 0;
    return {
      transform: [{ translateY: translateY.value - safeHeight }],
      height: safeHeight,
      opacity: height - safeHeight > 5 ? visible : 0,
    };
  });

  //pososouva dolni gradient
  const downGradientStyle = useAnimatedStyle(() => {
    const bottomLimit = top + height;
    const maxHeight = bottomLimit - translateY.value;
    const safeHeight = Math.max(Math.min(translateHeightDown.value, maxHeight), 1);
    const visible = direction.value ? 0 : 1;
    return {
      transform: [{ translateY: translateY.value }],
      height: safeHeight,
      opacity: height - safeHeight > 5 ? visible : 0,
    };
  });

  return (
    <>
      {/* horni gradient */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left,
            width,
            overflow: "hidden",
            pointerEvents: "none",
          },
          upGradientStyle,
        ]}
      >
        <LinearGradient
          colors={["rgba(59, 250, 59, 0.5)", "rgba(255, 255, 255, 0)"]}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {/* cara */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left,
            width,
            height: 5,
            backgroundColor: "rgba(81, 217, 81, 0.8)",
            pointerEvents: "none",
          },
          animatedStyle,
        ]}
      />

      {/* dolni gradient */}
      <Animated.View
        style={[
          {
            position: "absolute",
            left,
            width,
            overflow: "hidden",
            pointerEvents: "none",
          },
          downGradientStyle,
        ]}
      >
        <LinearGradient
          colors={["rgba(59, 250, 59, 0.5)", "rgba(255,255,255,0.0)"]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </>
  );
}

export const ScannerLine = memo(ScannerLineComponent);
