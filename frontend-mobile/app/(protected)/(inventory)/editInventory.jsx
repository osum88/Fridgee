import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from "react";
import { StyleSheet, View, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useNavigation } from "expo-router";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { responsiveSize } from "@/utils/scale";
import { handleApiError } from "@/utils/handleApiError";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useUpdateInventory } from "@/hooks/queries/inventory/useInventoryMutation";
import { useInventoryDetail } from "@/hooks/queries/inventory/useInventoryQuary";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useQueryClient } from "@tanstack/react-query";
import { InventoryIconGrid } from "../../../components/common/InventoryIconGrid";

export default function EditInventoryScreen() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("refrigerator");
  const isSaving = useRef(false);

  const router = useRouter();
  const colors = useThemeColor();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);

  const { data: inventory } = useInventoryDetail(activeInventory.id);
  const { updateInventory, isPending: isSubmitting } = useUpdateInventory(activeInventory.id);

  // naplneni dat z inventare
  useEffect(() => {
    if (inventory?.data) {
      setTitle(inventory.data.title ?? "");
      setSelectedIcon(inventory.data.icon ?? "refrigerator");
    }
  }, [inventory]);

  // ulozeni
  const handleSave = useCallback(async () => {
    if (isSubmitting || isSaving.current) return;
    if (!title) {
      setError(i18n.t("errors.inventoryTitle.STRING_EMPTY"));
      return;
    }
    setError("");

    updateInventory.mutate(
      { title, icon: selectedIcon },
      {
        onSuccess: async (data) => {
          isSaving.current = true;
          setError("");
          queryClient.invalidateQueries({
            queryKey: ["food-inventory", parseInt(activeInventory.id)],
          });
          queryClient.invalidateQueries({ queryKey: ["inventories"] });
          if (data?.data) {
            const { title, memberCount } = data.data;
            setActiveInventory({ title: title, memberCount: memberCount });
          }
          router.back();
        },
        onError: (error) => {
          handleApiError(error, setError);
        },
      },
    );
  }, [
    activeInventory.id,
    isSubmitting,
    queryClient,
    router,
    selectedIcon,
    setActiveInventory,
    title,
    updateInventory,
  ]);

  //tlacitko ulozeni
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={isSubmitting || isSaving.current} onPress={handleSave}>
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isSubmitting || isSaving.current}
            color={colors}
            text={i18n.t("save")}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, selectedIcon, colors, updateInventory, isSubmitting, router, handleSave]);

  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView safe={true} style={styles.contentWrapper}>
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

            <InventoryIconGrid
              numColumns={4}
              selectedIcon={selectedIcon}
              onSelect={setSelectedIcon}
              colors={colors}
            />
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
});
