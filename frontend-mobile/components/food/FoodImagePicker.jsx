import React from "react";
import { View, Image, TouchableOpacity, StyleSheet } from "react-native";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";
import { ActivityIndicator } from "react-native-paper";

export const FoodImagePicker = ({ imageUrl, onPickImage, isLoading }) => {
  const color = useThemeColor();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageWrapper,
          { borderColor: color.fullName, backgroundColor: color.surface },
        ]}
        onPress={onPickImage}
        activeOpacity={0.8}
      >
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <IconSymbol
              name="camera.fill"
              size={responsiveSize.moderate(45)}
              color={color.inputIcon}
            />
          </View>
        )}

        {isLoading && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator animating={true} size="large" color={color.primary} />
          </View>
        )}

        {imageUrl && (
          <View style={[styles.editBadge, { backgroundColor: color.stepperButton }]}>
            <IconSymbol name="pencil" size={responsiveSize.moderate(18)} color={"white"} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginBottom: responsiveSize.vertical(15),
  },
  imageWrapper: {
    width: responsiveSize.moderate(120),
    height: responsiveSize.moderate(120),
    borderRadius: responsiveSize.moderate(8),
    borderWidth: 1.4,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editBadge: {
    position: "absolute",
    bottom: responsiveSize.vertical(5),
    right: responsiveSize.horizontal(5),
    width: responsiveSize.horizontal(30),
    height: responsiveSize.vertical(30),
    borderRadius: responsiveSize.moderate(40),
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
});
