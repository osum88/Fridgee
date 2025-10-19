import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet, Animated, TouchableOpacity } from "react-native";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useEffect, useRef, useState } from "react";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import { SecureAccessModal } from "@/components/modals/SecureAccessModal";

//jeden item card se skeletonem a moznosti zakryt obsah
export function CardItemSecret({
  iconName,
  iconSize = responsiveSize.moderate(19),
  label,
  value,
  isLoading,
  isSecrete = false,
  type = "iban",
  styleOverrides = {},
  onChangeText,
  ...props
}) {
  const color = useThemeColor();
  const { container, icon, content, labelText, valueText } = styleOverrides;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const [showSecrete, setShowSecrete] = useState(false);
  const [showModal, setModal] = useState(false);

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

  // prechod mezi mezi barvami
  const animatedBg = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [color.surface, color.surfaceGradient],
  });

  return (
    <ThemedView style={[styles.infoItem, container]} darkColor={color.surface}>
      <IconSymbol
        name={iconName}
        size={iconSize}
        color={color.icon}
        style={icon}
      />
      <ThemedView
        style={[styles.infoContent, content]}
        darkColor={color.surface}
      >
        <ThemedText
          style={[styles.infoLabel, { color: color.icon }, labelText]}
        >
          {label}
        </ThemedText>

        {isLoading ? (
          <Animated.View
            style={[
              styles.skeleton,
              {
                backgroundColor: animatedBg,
              },
            ]}
          />
        ) : (
          <ThemedText style={[styles.infoValue, valueText]}>
            {showSecrete ? value : "*************"}
          </ThemedText>
        )}
      </ThemedView>
      {isSecrete && (
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setModal(!showModal && !showSecrete);
            setShowSecrete(false);
          }}
        >
          <IconSymbol
            size={responsiveSize.moderate(24)}
            name={showSecrete ? "eye" : "eye.slash"}
            color={color.icon}
          />
        </TouchableOpacity>
      )}
      <SecureAccessModal
        visible={showModal}
        setVisible={setModal}
        type={type}
        onPress={() => setShowSecrete(true)}
        onChangeText={onChangeText}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(10),
  },
  infoContent: {
    marginLeft: responsiveSize.vertical(14),
    gap: responsiveSize.horizontal(3),
    flex: 1,
  },
  infoLabel: {
    fontSize: responsiveFont(11),
    color: "#6C757D",
  },
  infoValue: {
    fontSize: responsiveFont(15),
    fontWeight: "500",
  },
  skeleton: {
    height: responsiveFont(15),
    width: "80%",
    borderRadius: responsiveFont(6),
  },
  iconButton: {
    position: "absolute",
    right: responsiveSize.horizontal(-4),
    paddingVertical: responsiveSize.vertical(5),
    paddingHorizontal: responsiveSize.horizontal(5),
  },
});
