import { StyleSheet, useWindowDimensions, View } from "react-native";
import { responsiveSize } from "@/utils/scale";
import Svg, { Rect, Mask } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScannerLine } from "@/components/animated/ScannerLine";

export function ScannerOverlay() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  //rozmery overlay
  const boxSizeWidth = responsiveSize.horizontal(290);
  const boxSizeHeight = responsiveSize.vertical(230);
  const boxBorderWidth = responsiveSize.moderate(5);
  const boxRadius = responsiveSize.moderate(30);
  const topOffset = (height - boxSizeHeight) / 2 + insets.top / 3;
  const sideOffset = (width - boxSizeWidth) / 2;
  const cornerSize = 65;

  return (
    <>
      {/* tmavy overlay okolo scannu */}
      <Svg
        width={width}
        height={height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Mask id="mask">
          <Rect width="100%" height="100%" fill="white" />
          <Rect
            x={sideOffset + boxBorderWidth}
            y={topOffset + boxBorderWidth}
            width={boxSizeWidth - boxBorderWidth * 2}
            height={boxSizeHeight - boxBorderWidth * 2}
            rx={boxRadius - boxBorderWidth}
            ry={boxRadius - boxBorderWidth}
            fill="black"
          />
        </Mask>
        <Rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#mask)"
        />
      </Svg>

      {/* skenovaci cara */}
      <ScannerLine
        top={topOffset + boxBorderWidth * 3}
        height={boxSizeHeight - boxBorderWidth * 6}
        left={sideOffset + boxBorderWidth}
        width={boxSizeWidth - boxBorderWidth * 2}
        paused={false}
      />

      {/* okraje skeneru */}
      <View
        style={[
          {
            top: topOffset,
            left: sideOffset,
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: boxBorderWidth,
            borderLeftWidth: boxBorderWidth,
            borderTopLeftRadius: boxRadius,
          },
          styles.scanArea,
        ]}
      />
      <View
        style={[
          {
            top: topOffset,
            left: sideOffset + boxSizeWidth - cornerSize,
            width: cornerSize,
            height: cornerSize,
            borderTopWidth: boxBorderWidth,
            borderRightWidth: boxBorderWidth,
            borderTopRightRadius: boxRadius,
          },
          styles.scanArea,
        ]}
      />
      <View
        style={[
          {
            top: topOffset + boxSizeHeight - cornerSize,
            left: sideOffset,
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: boxBorderWidth,
            borderLeftWidth: boxBorderWidth,
            borderBottomLeftRadius: boxRadius,
          },
          styles.scanArea,
        ]}
      />
      <View
        style={[
          {
            top: topOffset + boxSizeHeight - cornerSize,
            left: sideOffset + boxSizeWidth - cornerSize,
            width: cornerSize,
            height: cornerSize,
            borderBottomWidth: boxBorderWidth,
            borderRightWidth: boxBorderWidth,
            borderBottomRightRadius: boxRadius,
          },
          styles.scanArea,
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  scanArea: {
    position: "absolute",
    borderColor: "rgba(245, 245, 245, 0.9)",
  },
});
