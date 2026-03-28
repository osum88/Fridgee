import React, { useState, useCallback, useLayoutEffect } from "react";
import { StyleSheet, View, Pressable, ScrollView, TouchableOpacity } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { DeleteAlert } from "@/components/modals/DeleteAlert";
import { BaseBottomSheet } from "@/components/bottomSheet/BaseBottomSheet";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { handleApiError } from "@/utils/handleApiError";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useNavigation } from "expo-router";
import { EmptyState } from "@/components/common/EmptyState";
import {
  useCreateShoppingList,
  useUpdateShoppingList,
  useDeleteShoppingList,
} from "@/hooks/queries/shoppingLists/useShoppingListsMutation";
import { useShoppingListsOnly } from "@/hooks/queries/shoppingLists/useShoppingListsQuary";
import { showGlobalError } from "@/utils/showGlobalError";

export default function ShoppingListsSettingScreen() {
  const colors = useThemeColor();
  const activeInventory = useInventoryStore((state) => state.activeInventory);

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState("");
  const [addTitle, setAddTitle] = useState("");
  const [addError, setAddError] = useState("");

  const navigation = useNavigation();

  const { data: shoppingLists } = useShoppingListsOnly(
    activeInventory.id,
    activeInventory.memberCount,
  );
  const { mutate: createList, isPending: isCreating } = useCreateShoppingList(activeInventory.id);
  const { mutate: updateList, isPending: isUpdating } = useUpdateShoppingList(activeInventory.id);
  const { mutate: deleteList } = useDeleteShoppingList(activeInventory.id);

  const lists = shoppingLists ?? [];

  const handleEditOpen = useCallback((list) => {
    setSelectedList(list);
    setEditTitle(list?.title);
    setEditError("");
    setEditVisible(true);
  }, []);

  const handleDeleteOpen = useCallback((list) => {
    setSelectedList(list);
    setDeleteVisible(true);
  }, []);

  const handleDelete = useCallback(() => {
    if (!selectedList) return;
    if (selectedList?.hasItems) {
      return showGlobalError({ response: { status: 409, _isPermission: true, code: "LIST_CONTAINS_ITEMS" } });
    }
    deleteList(
      { shoppingListId: selectedList.id },
      {
        onError: (error) => handleApiError(error, () => {}),
      },
    );
  }, [selectedList, deleteList]);

  const handleEditSave = useCallback(() => {
    if (!editTitle.trim()) {
      setEditError(i18n.t("errors.shoppingList.STRING_EMPTY"));
      return;
    }
    updateList(
      { shoppingListId: selectedList.id, data: { title: editTitle.trim() } },
      {
        onSuccess: () => setEditVisible(false),
        onError: (error) => handleApiError(error, setEditError),
      },
    );
  }, [editTitle, selectedList, updateList]);

  const handleAddSave = useCallback(() => {
    if (!addTitle.trim()) {
      setAddError(i18n.t("errors.shoppingListTitle.STRING_EMPTY"));
      return;
    }
    createList(
      { data: { title: addTitle.trim() } },
      {
        onSuccess: () => {
          setAddVisible(false);
          setAddTitle("");
          setAddError("");
        },
        onError: (error) => handleApiError(error, setAddError),
      },
    );
  }, [addTitle, createList]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={addVisible} onPress={() => setAddVisible(true)}>
          <SaveButtonContent
            key={`header-add-${colors.background}`}
            color={colors}
            text={i18n.t("add")}
          />
        </TouchableOpacity>
      ),
    });
  }, [colors, addVisible, navigation]);

  return (
    <ThemedView style={styles.container}>
      {lists.length === 0 ? (
        <EmptyState
          icon="cart"
          title={i18n.t("noShoppingListTitle")}
          subtitle={i18n.t("noShoppingListSubtitle")}
        />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {lists.map((list, index) => (
            <React.Fragment key={list.id}>
              <View style={styles.row}>
                <ThemedText style={styles.listTitle}>{list?.title}</ThemedText>
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => handleEditOpen(list)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: colors.surface },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <IconSymbol
                      name="pencil"
                      size={responsiveSize.moderate(18)}
                      color={colors.notFoccusIcon}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteOpen(list)}
                    hitSlop={8}
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: colors.errorBackground },
                      pressed && { opacity: 0.6 },
                    ]}
                  >
                    <IconSymbol
                      name="xmark"
                      size={responsiveSize.moderate(18)}
                      color={colors.error}
                    />
                  </Pressable>
                </View>
              </View>
              {index < lists.length - 1 && <ThemedLine />}
            </React.Fragment>
          ))}
        </ScrollView>
      )}

      {/* edit bottom sheet */}
      <BaseBottomSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        colors={colors}
        styleSheet={{ paddingHorizontal: responsiveSize.horizontal(20) }}
      >
        <ThemedText style={styles.sheetTitle}>{i18n.t("editShoppingList")}</ThemedText>
        <UniversalTextInput
          value={editTitle}
          onChangeText={(text) => {
            setEditTitle(text);
            setEditError("");
          }}
          maxLength={50}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder={i18n.t("shoppingListPlaceholder")}
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
        <ThemedText style={styles.sheetTitle}>{i18n.t("addShoppingList")}</ThemedText>
        <UniversalTextInput
          value={addTitle}
          onChangeText={(text) => {
            setAddTitle(text);
            setAddError("");
          }}
          maxLength={50}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder={i18n.t("shoppingListPlaceholder")}
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
        title={i18n.t("removeShoppingList")}
        description={[i18n.t("removeShoppingListConfirm")]}
        deleteItem={selectedList?.title}
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
  listTitle: {
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
