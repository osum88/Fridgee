import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useGetInventoryCategoriesQuery } from "@/hooks/queries/inventory/useInventoryQuary";
import {
  useUpdateFoodCategory,
  useDeleteFoodCategory,
  useCreateFoodCategory,
} from "@/hooks/queries/food-category/useFoodCategoryMutation";
import { DeleteAlert } from "@/components/modals/DeleteAlert";
import { BaseBottomSheet } from "@/components/bottomSheet/BaseBottomSheet";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { handleApiError } from "@/utils/handleApiError";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useNavigation } from "expo-router";

const ADD_EDIT_ROLES = ["OWNER", "EDITOR"];
const DELETE_ROLES = ["OWNER"];

export default function InventoryCategoriesScreen() {
  const colors = useThemeColor();
  const activeInventory = useInventoryStore((state) => state.activeInventory);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState("");

  const navigation = useNavigation();

  //vraci vsechny kategorie
  const { data: inventoryCategories } = useGetInventoryCategoriesQuery(
    activeInventory.id,
    activeInventory.memberCount,
  );

  //update kategorie
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateFoodCategory(
    activeInventory.id,
  );
  //smazani kategorie
  const { mutate: deleteCategory } = useDeleteFoodCategory(activeInventory.id);
  //prida kategorii
  const { mutate: createCategory, isPending: isCreating } = useCreateFoodCategory(
    activeInventory.id,
  );

  const categories = inventoryCategories?.data ?? [];

  //otevre edit sheet
  const handleEditOpen = useCallback((category) => {
    setSelectedCategory(category);
    setEditTitle(category.title);
    setEditError("");
    setEditVisible(true);
  }, []);

  //otevre alert delete
  const handleDeleteOpen = useCallback((category) => {
    setSelectedCategory(category);
    setDeleteVisible(true);
  }, []);

  //smaze kategorii
  const handleDelete = useCallback(() => {
    if (!selectedCategory) return;
    deleteCategory(selectedCategory.id);
  }, [selectedCategory, deleteCategory]);

  //upravi kategorii
  const handleEditSave = useCallback(() => {
    if (!editTitle.trim()) {
      setEditError(i18n.t("errors.category.STRING_EMPTY"));
      return;
    }
    updateCategory(
      { categoryId: selectedCategory.id, title: editTitle.trim() },
      {
        onSuccess: () => setEditVisible(false),
        onError: (error) => handleApiError(error, setEditError),
      },
    );
  }, [editTitle, selectedCategory, updateCategory]);

  //prida kategorii
  const handleAddSave = useCallback(() => {
    if (!addTitle.trim()) {
      setAddError(i18n.t("errors.category.STRING_EMPTY"));
      return;
    }
    createCategory(addTitle.trim(), {
      onSuccess: () => {
        setAddVisible(false);
        setAddTitle("");
        setAddError("");
      },
      onError: (error) => handleApiError(error, setAddError),
    });
  }, [addTitle, createCategory]);

  const canAddEdit = ADD_EDIT_ROLES.includes(activeInventory?.role);
  const canDelete = DELETE_ROLES.includes(activeInventory?.role);

  //tlacitko pridani otevre add sheetBottom
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        canAddEdit && (
          <TouchableOpacity disabled={addVisible} onPress={() => setAddVisible(true)}>
            <SaveButtonContent
              key={`header-add-${colors.background}`}
              color={colors}
              text={i18n.t("add")}
            />
          </TouchableOpacity>
        ),
    });
  }, [colors, addVisible, navigation, canAddEdit]);

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {categories.map((category, index) => (
          <React.Fragment key={category.id}>
            <View style={styles.row}>
              <ThemedText style={styles.categoryTitle}>{category.title}</ThemedText>
              <View style={styles.actions}>
                {canAddEdit && (
                  <Pressable
                    onPress={() => handleEditOpen(category)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: colors.primaryBackground },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <IconSymbol
                      name="pencil"
                      size={responsiveSize.moderate(18)}
                      color={colors.primary}
                    />
                  </Pressable>
                )}
                {canDelete && (
                  <Pressable
                    onPress={() => handleDeleteOpen(category)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: colors.errorBackground },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <IconSymbol
                      name="trash"
                      size={responsiveSize.moderate(18)}
                      color={colors.error}
                    />
                  </Pressable>
                )}
              </View>
            </View>
            {index < categories.length - 1 && <ThemedLine />}
          </React.Fragment>
        ))}
      </ScrollView>

      {/* edit bottom sheet */}
      <BaseBottomSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        colors={colors}
        styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
      >
        <ThemedText style={styles.sheetTitle}>{i18n.t("editingCategory")}</ThemedText>
        <UniversalTextInput
          value={editTitle}
          onChangeText={(text) => {
            setEditTitle(text);
            setEditError("");
          }}
          maxLength={50}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder={i18n.t("categoryPlaceholder")}
          error={editError}
          setError={setEditError}
        />
        <Pressable
          onPress={handleEditSave}
          disabled={isUpdating}
          style={[
            styles.saveBtn,
            { backgroundColor: isUpdating ? colors.text + "22" : colors.primary },
          ]}
        >
          <ThemedText style={[styles.saveBtnText, { color: colors.onPrimary }]}>
            {i18n.t("save")}
          </ThemedText>
        </Pressable>
      </BaseBottomSheet>

      {/* add bottom sheet */}
      <BaseBottomSheet
        visible={addVisible}
        onClose={() => setAddVisible(false)}
        colors={colors}
        styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
      >
        <ThemedText style={styles.sheetTitle}>{i18n.t("addingCategory")}</ThemedText>
        <UniversalTextInput
          value={addTitle}
          onChangeText={(text) => {
            setAddTitle(text);
            setAddError("");
          }}
          maxLength={50}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder={i18n.t("categoryPlaceholder")}
          error={addError}
          setError={setAddError}
        />
        <Pressable
          onPress={handleAddSave}
          disabled={isCreating}
          style={[
            styles.saveBtn,
            { backgroundColor: isCreating ? colors.text + "22" : colors.primary },
          ]}
        >
          <ThemedText style={[styles.saveBtnText, { color: colors.onPrimary }]}>
            {i18n.t("add")}
          </ThemedText>
        </Pressable>
      </BaseBottomSheet>
      {/* delete alert */}
      <DeleteAlert
        visible={deleteVisible}
        setVisible={setDeleteVisible}
        title={i18n.t("removeCategory")}
        description={[i18n.t("removeCategoryConfirmPart1"), i18n.t("removeCategoryConfirmPart2")]}
        deleteItem={selectedCategory?.title}
        questionMark={true}
        confirmLabel={i18n.t("remove1")}
        onConfirm={handleDelete}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: responsiveSize.horizontal(24),
    paddingVertical: responsiveSize.vertical(12),
    flex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveSize.vertical(13),
  },
  categoryTitle: {
    flex: 1,
    fontSize: responsiveSize.moderate(15),
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(16),
  },
  actionBtn: {
    padding: responsiveSize.moderate(7),
    borderRadius: responsiveSize.moderate(8),
  },
  sheetTitle: {
    fontSize: responsiveSize.moderate(17),
    fontWeight: "600",
    marginBottom: responsiveSize.vertical(16),
  },
  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
  inputOutline: {
    borderRadius: responsiveSize.moderate(7),
  },
  saveBtn: {
    height: responsiveSize.vertical(50),
    borderRadius: responsiveSize.moderate(14),
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "600",
  },
});
