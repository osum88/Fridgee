import React, { useState, useCallback, useMemo, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize, responsiveFont } from "@/utils/scale";
import i18n from "@/constants/translations";
import { useTheme } from "@react-navigation/native";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { useUpdateFoodMutation } from "@/hooks/queries/food/useFoodMutation";
import { handleApiError } from "@/utils/handleApiError";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedButton } from "@/components/themed/ThemedButton";

const CategoryModalComponent = ({
  visible,
  onClose,
  categories = [],
  currentCategoryId,
  colors,
  inventoryId,
  catalogId,
  foodId,
}) => {
  const [newCategory, setNewCategory] = useState("");
  const [selectedId, setSelectedId] = useState(currentCategoryId ?? "no-category");
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState("");
  const { colorScheme } = useTheme();
  const { updateFood, isSubmitting } = useUpdateFoodMutation();
  const queryClient = useQueryClient();
  const updating = useRef(false);

  //zavre modal
  const handleClose = useCallback(() => {
    setNewCategory("");
    setIsAddingNew(false);
    onClose();
  }, [onClose]);

  //potvrzeni vybrani
  const handleConfirm = useCallback(() => {
    if (isSubmitting || updating.current) return;

    const categoryData = newCategory.trim()
      ? { categoryTitle: newCategory.trim() }
      : selectedId === "no-category"
        ? { categoryTitle: "" }
        : { categoryId: selectedId };

    updating.current = true;
    updateFood.mutate(
      { foodData: { ...categoryData, foodId } },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries({
            queryKey: ["inventory-content", parseInt(inventoryId)],
          });
          queryClient.refetchQueries({
            queryKey: ["food-detail", parseInt(inventoryId), parseInt(catalogId), parseInt(foodId)],
          });
          queryClient.invalidateQueries({ queryKey: ["food-categories", parseInt(inventoryId)] });
          updating.current = false;
          handleClose();
        },
        onError: (error) => {
          updating.current = false;
          handleApiError(error, setError);
        },
      },
    );
  }, [
    newCategory,
    selectedId,
    handleClose,
    catalogId,
    foodId,
    inventoryId,
    isSubmitting,
    queryClient,
    updateFood,
  ]);

  //vybere kategorii
  const handleSelectCategory = useCallback((id) => {
    setSelectedId(id);
    setNewCategory("");
    setIsAddingNew(false);
  }, []);

  const categoriesWithDefault = useMemo(
    () => [{ id: "no-category", title: i18n.t("uncategorized") }, ...categories],
    [categories],
  );

  const canConfirm =
    newCategory.trim().length > 0 || (selectedId && selectedId !== currentCategoryId);

  const borderColor = colorScheme === "dark" ? "rgba(255,255,255,0)" : "rgba(0,0,0,0.17)";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={Keyboard.dismiss} />
      <View style={styles.centered}>
        <ThemedView style={[styles.modal, { backgroundColor: colors.background }]}>
          {/* header */}
          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {i18n.t(isAddingNew ? "createCategory" : "selectCategory")}
            </ThemedText>
          </View>
          {/* input kategorie */}
          {isAddingNew ? (
            <UniversalTextInput
              value={newCategory}
              onChangeText={(text) => {
                setNewCategory(text);
                if (text.trim()) setSelectedId(null);
              }}
              error={error}
              setError={(value) => setError(value)}
              label={i18n.t("newCategory")}
              maxLength={40}
              style={styles.input}
              outlineStyle={styles.inputOutline}
            />
          ) : (
            <ScrollView
              style={styles.list}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {categoriesWithDefault.map((cat) => {
                const isSelected = selectedId === cat.id && !newCategory.trim();
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => handleSelectCategory(cat.id)}
                    style={[
                      styles.categoryItem,
                      { backgroundColor: colors.background, borderColor: borderColor },
                      isSelected && {
                        borderColor: colors.primary,
                        paddingRight: responsiveSize.horizontal(30),
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryText,
                        isSelected && { color: colors.primary, fontWeight: "500" },
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {cat.title}
                    </ThemedText>
                    {isSelected && (
                      <IconSymbol
                        name="checkmark"
                        size={responsiveSize.moderate(16)}
                        color={colors.primary}
                        style={{ position: "absolute", right: responsiveSize.horizontal(10) }}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {/* pridani kategorie */}
              <TouchableOpacity
                onPress={() => setIsAddingNew(true)}
                disabled={isSubmitting || updating.current}
                style={[
                  styles.categoryItem,
                  { backgroundColor: colors.background, borderColor: borderColor },
                ]}
              >
                <View style={styles.addRow}>
                  <IconSymbol name="plus" size={responsiveSize.moderate(16)} color={colors.text} />
                  <ThemedText style={[styles.categoryText]}>{i18n.t("newCategory")}</ThemedText>
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}

          {/* tlacitka */}
          <View style={styles.buttons}>
            <ThemedButton
              onPress={handleClose}
              style={[styles.btn, { backgroundColor: colors.surface }]}
            >
              <ThemedText style={styles.btnText}>{i18n.t("cancel")}</ThemedText>
            </ThemedButton>
            <ThemedButton
              onPress={handleConfirm}
              disabled={!canConfirm}
              loading={isSubmitting || updating.current}
              style={[
                styles.btn,
                { backgroundColor: canConfirm ? colors.primary : colors.primary + "44" },
              ]}
            >
              <ThemedText style={[styles.btnText, { color: colors.onPrimary }]}>
                {i18n.t("confirm")}
              </ThemedText>
            </ThemedButton>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
};

export const CategoryModal = React.memo(CategoryModalComponent);

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(20),
  },
  modal: {
    width: "100%",
    borderRadius: responsiveSize.moderate(16),
    padding: responsiveSize.moderate(20),
    maxHeight: responsiveSize.vertical(520),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSize.vertical(16),
  },
  title: {
    fontSize: responsiveFont(17),
    fontWeight: "600",
  },
  list: {
    maxHeight: responsiveSize.vertical(220),
  },
  categoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(11),
    paddingHorizontal: responsiveSize.horizontal(10),
    borderRadius: responsiveSize.moderate(8),
    marginBottom: responsiveSize.vertical(12),
    borderWidth: 1,
  },
  categoryText: {
    fontSize: responsiveFont(15),
  },
  newCategoryInput: {
    marginBottom: responsiveSize.vertical(6),
    borderRadius: responsiveSize.moderate(10),
  },
  buttons: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(10),
    marginTop: responsiveSize.vertical(8),
  },
  btn: {
    flex: 1,
    height: responsiveSize.vertical(44),
    borderRadius: responsiveSize.moderate(10),
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: responsiveFont(15),
    fontWeight: "500",
  },
  addRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(7),
  },
  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
  inputOutline: {
    borderRadius: responsiveSize.moderate(10),
  },
});
