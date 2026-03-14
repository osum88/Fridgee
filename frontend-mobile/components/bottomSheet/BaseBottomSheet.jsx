import React, { useRef, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  Modal,
  Animated,
  Platform,
  ScrollView,
  PanResponder,
  useWindowDimensions,
  Keyboard,
} from "react-native";
import { responsiveSize } from "@/utils/scale";
import { useTheme } from "@/contexts/ThemeContext";

const HANDLE_WIDTH = responsiveSize.horizontal(36);
const HANDLE_HEIGHT = responsiveSize.vertical(10) + responsiveSize.vertical(16) + 4;

const BaseBottomSheetComponent = ({
  visible,
  onClose,
  colors,
  children,
  scrollable = false,
  maxHeightRatio = null,
  styleSheet,
  contentStyle,
  showBottom = true,
  header,
  footer,
}) => {
  const translateY = useRef(new Animated.Value(400)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const { colorScheme } = useTheme();
  const { width, height: screenHeight } = useWindowDimensions();
  const [contentHeight, setContentHeight] = useState(null);
  const maxHeightPx = maxHeightRatio ? screenHeight * maxHeightRatio : screenHeight;

  //umoznuje stahnout dolu bottom sheet
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gesture) => gesture.dy > 5,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy > 0) panY.setValue(gesture.dy);
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy > 80 || gesture.vy > 0.5) {
          Animated.timing(panY, {
            toValue: 600,
            duration: 200,
            useNativeDriver: true,
          }).start(onClose);
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    }),
  ).current;

  useEffect(() => {
    if (visible) {
      panY.setValue(0);
      setContentHeight(null);
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 70,
          friction: 12,
        }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 400, duration: 200, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 160, useNativeDriver: true }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const sheetHeight = maxHeightRatio
    ? contentHeight
      ? Math.min(contentHeight + HANDLE_HEIGHT, maxHeightPx)
      : maxHeightPx
    : undefined;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarColor={colorScheme === "dark" ? "#1f1f1f" : "#ffffff"}
      supportedOrientations={["portrait"]}
    >
      <Animated.View style={[styles.backdrop, { opacity }]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            Keyboard.dismiss();
            onClose();
          }}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: Animated.add(translateY, panY) }],
          },
          sheetHeight && { height: sheetHeight },
          styleSheet,
        ]}
      >
        <View
          style={[
            styles.handleContainer,
            {
              backgroundColor: colors.backgroundCard,
              paddingHorizontal: (width - HANDLE_WIDTH) / 2,
            },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={[styles.handle, { backgroundColor: colors.text + "22" }]} />
        </View>
        {header && header}
        {scrollable ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            onContentSizeChange={(_, h) => setContentHeight(h)}
            style={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
          >
            {children}
            {showBottom && <View style={styles.bottom} />}
          </ScrollView>
        ) : (
          <View
            onLayout={(e) => setContentHeight(e.nativeEvent.layout.height)}
            style={[styles.content, contentStyle]}
          >
            <Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }}>
              {children}
              {showBottom && <View style={styles.bottom} />}
            </Pressable>
          </View>
        )}

        {footer && footer}
      </Animated.View>
    </Modal>
  );
};

export const BaseBottomSheet = React.memo(BaseBottomSheetComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: responsiveSize.moderate(20),
    borderTopRightRadius: responsiveSize.moderate(20),
  },
  handleContainer: {
    paddingTop: responsiveSize.vertical(10),
    paddingBottom: responsiveSize.vertical(16),
  },
  handle: {
    width: HANDLE_WIDTH,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },
  content: {
    flexGrow: 1,
  },
  bottom: {
    height: Platform.OS === "ios" ? responsiveSize.vertical(32) : responsiveSize.vertical(18),
  },
});
