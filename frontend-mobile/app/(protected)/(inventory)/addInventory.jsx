import React, { useState, useLayoutEffect, useMemo, useRef } from "react";
import { StyleSheet, View, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { INVENTORY_THEMES } from "@/constants/colors";
import { responsiveSize } from "@/utils/scale";
import { handleApiError } from "@/utils/handleApiError";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { INVENTORY_ICONS } from "@/constants/inventory";
import useCreateInventory from "@/hooks/queries/inventory/useCreateInventory";

export default function AddInventoryScreen() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("refrigerator");
  const isSaving = useRef(false);

  const router = useRouter();
  const colors = useThemeColor();
  const navigation = useNavigation();

  const { createInventory, isSubmitting } = useCreateInventory();

  const { width } = Dimensions.get("window");
  const PADDING_HORIZONTAL = Math.round(responsiveSize.horizontal(20));
  const AVAILABLE_WIDTH = width - PADDING_HORIZONTAL * 2;

  // 4 ikony v rade
  const NUM_COLUMNS = 4;
  // mezeri mezi ikonami
  const COLUMN_GAP = Math.round(responsiveSize.moderate(16));
  // velikost jedne ikony (celkova sirka - součet mezer mezi ikonami) / počet ikon
  const ICON_SIZE = (AVAILABLE_WIDTH - COLUMN_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

  //nastavi tlacitko ulozit v headeru
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          disabled={isSubmitting}
          onPress={() => {
            if (isSubmitting) return;
            if (!title) {
              setError(i18n.t("errors.inventoryTitle.STRING_EMPTY"));
              return;
            }
            setError("");

            createInventory.mutate(
              { title: title, icon: selectedIcon },
              {
                onSuccess: () => {
                  isSaving.current = true;
                  setError("");
                  router.back();
                },
                onError: (err) => {
                  handleApiError(err, setError);
                },
              },
            );
          }}
        >
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isSubmitting}
            color={colors}
            text={i18n.t("add")}
          ></SaveButtonContent>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, selectedIcon, colors, createInventory, isSubmitting, router]);

  const renderedIconGrid = useMemo(() => {
    return (
      <View style={[styles.iconGrid, { gap: COLUMN_GAP, width: AVAILABLE_WIDTH }]}>
        {INVENTORY_ICONS.map((iconName) => {
          const isSelected = selectedIcon === iconName;
          const theme = INVENTORY_THEMES[iconName] || { light: colors.text, dark: colors.text };
          return (
            <TouchableOpacity
              key={iconName}
              onPress={() => setSelectedIcon(iconName)}
              style={[
                styles.iconOption,
                { width: ICON_SIZE, height: ICON_SIZE, backgroundColor: colors.cardBackground },
                isSelected && { borderColor: theme.light, borderWidth: 2 },
              ]}
            >
              <IconSymbol
                name={iconName}
                size={responsiveSize.moderate(30)}
                color={isSelected ? theme.light : colors.tabIconDefault}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }, [selectedIcon, colors, ICON_SIZE, COLUMN_GAP, AVAILABLE_WIDTH]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView safe={true} style={[styles.contentWrapper]}>
          <View style={{ flex: 1, marginBottom: responsiveSize.vertical(30) }}>
            <ThemedText style={[styles.label, { marginTop: responsiveSize.vertical(14) }]}>
              {i18n.t("inventoryName")}
            </ThemedText>

            <UniversalTextInput
              value={title || ""}
              onChangeText={(text) => {
                setTitle(text);
                setError("");
              }}
              maxLength={50}
              style={styles.input}
              outlineStyle={styles.inputOutlineStyle}
              placeholder={i18n.t("enterInventoryNameExample")}
              error={error}
              setError={(value) => setError(value)}
            />
            <ThemedText style={[styles.label, { marginTop: responsiveSize.vertical(3) }]}>
              {i18n.t("selectIcon")}
            </ThemedText>

            {renderedIconGrid}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: responsiveSize.horizontal(20),
    paddingTop: responsiveSize.vertical(8),
    paddingBottom: responsiveSize.vertical(20),
  },
  label: {
    fontWeight: "600",
    marginBottom: responsiveSize.vertical(8),
  },
  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
  inputOutlineStyle: {
    borderRadius: responsiveSize.moderate(7),
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginTop: responsiveSize.vertical(2),
  },
  iconOption: {
    borderRadius: responsiveSize.moderate(13),
    justifyContent: "center",
    alignItems: "center",
    borderColor: "transparent",
    borderWidth: 1,

    // iOS Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  buttonFooter: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(18),
    alignItems: "center",
  },
  btn: {
    flex: 1,
    paddingVertical: responsiveSize.vertical(14),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: responsiveSize.moderate(18),
    width: 10,
  },
});
