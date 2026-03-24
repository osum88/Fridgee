import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { ImageSelector } from "@/components/image/ImageSelector";
import { responsiveSize, responsiveFont, responsiveVertical } from "@/utils/scale";
import {
  updateFormValues,
  setTemporaryError,
  getVariant,
  validateNumericInput,
  formatNumberInput,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCallback, useState, useLayoutEffect, useMemo, useRef } from "react";
import { HelperText } from "react-native-paper";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { ThemedText } from "@/components/themed/ThemedText";
import { SearchableDropdown } from "@/components/input/SearchableDropdown";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import Tooltip from "react-native-walkthrough-tooltip";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { FoodImagePicker } from "@/components/food/FoodImagePicker";
import { useImageUpload } from "@/hooks/image/useImageUpload";
import { useUpdateFoodMutation } from "@/hooks/queries/food/useFoodMutation";
import { useGetFoodVariants } from "@/hooks/queries/food/useGetFoodQuary";
import { handleApiError } from "@/utils/handleApiError";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useQueryClient } from "@tanstack/react-query";

export const validateForm = (setErrors, inputText) => {
  if (!inputText?.labelTitle) {
    updateFormValues(setErrors, "labelTitle", i18n.t("errors.labelTitle.STRING_EMPTY"));
    return false;
  }
  if (
    inputText?.minimalQuantity &&
    !validateNumericInput(inputText.minimalQuantity, "minimalQuantity", setErrors, 9999, false)
  ) {
    return false;
  }
  return true;
};

export default function EditFoodScreen() {
  const [scrollSpace, setScrollSpace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef(null);
  const isUpdating = useRef(false);
  const queryClient = useQueryClient();

  const { initialData } = useLocalSearchParams();

  const parsedItem = useMemo(() => {
    try {
      return JSON.parse(initialData);
    } catch {
      return {};
    }
  }, [initialData]);

  const {
    foodId,
    catalogId,
    labelTitle,
    description,
    variantId: paramVariantId,
    variantTitle: paramVariantTitle,
    foodImageUrl: paramFoodImageUrl,
    foodImageCloudId: paramFoodImageCloudId,
    minimalQuantity,
    barcode,
  } = parsedItem;

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const navigation = useNavigation();
  const colors = useThemeColor();
  const { pickImage, takePhoto, uploadImage } = useImageUpload("back");

  // pouze OWNER a EDITOR mohou menit minimalQuantity a variantu
  const canEdit = activeInventory.role === "OWNER" || activeInventory.role === "EDITOR";

  const { updateFood, isSubmitting } = useUpdateFoodMutation(activeInventory.id);
  const { data: variants = [] } = useGetFoodVariants(activeInventory.id, catalogId);

  const variantOptions = useMemo(
    () =>
      variants.map((v) => ({
        label: v.variantTitle,
        value: v.variantId.toString(),
      })),
    [variants],
  );

  const [inputText, setInputText] = useState({
    labelTitle: labelTitle ?? "",
    description: description ?? "",
    variantId: paramVariantId ?? "undefined",
    variantTitle: paramVariantTitle ?? "",
    foodImageUrl: paramFoodImageUrl ?? "",
    foodImageCloudId: paramFoodImageCloudId ?? "",
    minimalQuantity: minimalQuantity ? String(minimalQuantity) : "",
  });

  const [errors, setErrors] = useState({
    labelTitle: "",
    description: "",
    variant: "",
    minimalQuantity: "",
    barcode: "",
  });

  const inputDataRef = useRef(inputText);
  inputDataRef.current = inputText;

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(colors), [colors]);

  const handleImagePick = useCallback(
    async (type) => {
      const actions = {
        camera: async () => {
          const uri = await takePhoto();
          if (uri) {
            setImage(uri);
            const { formData } = await uploadImage(uri);
            setFormData(formData);
          }
        },
        photo: async () => {
          const uri = await pickImage();
          if (uri) {
            setImage(uri);
            const { formData } = await uploadImage(uri);
            setFormData(formData);
          }
        },
        remove: () => {
          setImage(null);
          setFormData(null);
          updateFormValues(setInputText, { foodImageUrl: "", foodImageCloudId: "null" });
        },
      };
      await actions[type]?.();
    },
    [takePhoto, pickImage, uploadImage],
  );

  const memoizedImageUrl = useMemo(() => {
    if (image) return image;
    if (inputText.foodImageUrl) {
      const isFullUrl = inputText.foodImageUrl.startsWith("http");
      return isFullUrl
        ? inputText.foodImageUrl
        : `${IMAGEKIT_URL_ENDPOINT}${inputText.foodImageUrl}`;
    }
    return "";
  }, [image, inputText.foodImageUrl]);

  const handleSave = useCallback(() => {
    const { current } = inputDataRef;
    if (isUpdating.current || isSubmitting || !validateForm(setErrors, current)) return;

    isUpdating.current = true;
    const foodData = {
      foodId: parseInt(foodId),
      labelTitle: current.labelTitle,
      description: current.description || "",
      foodImageUrl: current.foodImageUrl,
      foodImageCloudId: current.foodImageCloudId,
      ...(canEdit && {
        minimalQuantity: current.minimalQuantity || 0,
        ...getVariant(current.variantId, current.variantTitle),
      }),
    };

    updateFood.mutate(
      { foodData, imageFormData: formData },
      {
        onSuccess: async (response) => {
          const food = response?.data;
          console.log("response", food);
          await queryClient.invalidateQueries({
            queryKey: ["inventory-content", parseInt(activeInventory.id)],
          });
          if (parseInt(food?.id) !== parseInt(foodId)) {
            queryClient.invalidateQueries({
              queryKey: ["food-detail", parseInt(activeInventory.id), parseInt(food?.catalogId)],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: [
                "food-detail",
                parseInt(activeInventory.id),
                parseInt(food?.catalogId),
                parseInt(food?.id),
              ],
            });
          }

          isUpdating.current = false;

          if (food?.id && food?.catalogId && parseInt(food?.id) !== parseInt(foodId)) {
            router.dismiss(2);
            router.replace({
              pathname: "/(protected)/(inventoryFoods)/foodDetail",
              params: { foodId: food.id, catalogId: food.catalogId },
            });
          } else {
            router.back();
          }
        },
        onError: (error) => {
          isUpdating.current = false;
          handleApiError(error, setErrors, errors, "labelTitle");
        },
      },
    );
  }, [
    isSubmitting,
    errors,
    foodId,
    formData,
    updateFood,
    queryClient,
    activeInventory.id,
    canEdit,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={isSubmitting || isUpdating.current} onPress={handleSave}>
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isSubmitting || isUpdating.current}
            color={colors}
            text={i18n.t("save")}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, isSubmitting, handleSave]);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ThemedView safe={true} style={styles.contentWrapper}>
          {/* Nazev */}
          <UniversalTextInput
            value={inputText.labelTitle || ""}
            onChangeText={(text) => {
              updateFormValues(setInputText, "labelTitle", text);
              updateFormValues(setErrors, "labelTitle", "");
            }}
            label={i18n.t("foodName")}
            maxLength={100}
            placeholder={i18n.t("enterFoodName")}
            inputColor={inputColor}
            error={errors.labelTitle}
            setError={(value) => updateFormValues(setErrors, "labelTitle", value)}
          />

          {/* Minimalni mnozstvi - pouze OWNER/EDITOR */}
          <Pressable
            onPress={() => {
              if (!canEdit) {
                setTemporaryError(
                  setErrors,
                  "minimalQuantity",
                  i18n.t("errors.minimalQuantity.OWNER_EDITOR_ONLY"),
                );
              }
            }}
          >
            <View pointerEvents={canEdit ? "auto" : "none"}>
              <UniversalTextInput
                value={inputText?.minimalQuantity || ""}
                onChangeText={(val) => {
                  const numeric = formatNumberInput(val, false);
                  if (numeric === undefined) return;
                  updateFormValues(setInputText, "minimalQuantity", numeric);
                  validateNumericInput(val, "minimalQuantity", setErrors, 9999, false);
                }}
                keyboardType="numeric"
                maxLength={4}
                label={i18n.t("minimalQuantity")}
                placeholder={"0"}
                error={errors.minimalQuantity}
                outlineStyle={styles.inputOutlineStyle}
                style={styles.input}
              />
            </View>
          </Pressable>

          {/* Varianta + tooltip - pouze OWNER/EDITOR */}
          <View style={styles.toolTipVariatContainer}>
            <View style={styles.toolTipContainer}>
              <Tooltip
                isVisible={showTooltip}
                content={
                  <ThemedText style={[styles.toolTipText, { color: colors.text }]}>
                    {i18n.t("variantExplanationTip3")}
                  </ThemedText>
                }
                placement="top"
                contentStyle={{ backgroundColor: colors.surface, borderRadius: 8 }}
                tooltipStyle={{ marginTop: responsiveSize.vertical(-28) }}
                style={{ maxWidth: responsiveSize.horizontal(270) }}
                backgroundColor="rgba(0,0,0,0.2)"
                onClose={() => setShowTooltip(false)}
                showChildInTooltip={false}
              >
                <TouchableOpacity
                  onPress={() => setShowTooltip(true)}
                  hitSlop={styles.toolTipHitSlop}
                >
                  <ThemedView>
                    <IconSymbol
                      size={responsiveSize.moderate(20)}
                      name={"info.circle"}
                      color={colors.inputIcon}
                    />
                  </ThemedView>
                </TouchableOpacity>
              </Tooltip>
            </View>
            <Pressable
              onPress={() => {
                if (!canEdit) {
                  setTemporaryError(
                    setErrors,
                    "variant",
                    i18n.t("errors.variant.OWNER_EDITOR_ONLY"),
                  );
                }
              }}
            >
              <View pointerEvents={canEdit ? "auto" : "none"}>
                <SearchableDropdown
                  value={inputText.variantId || ""}
                  onChange={(variantId) => {
                    updateFormValues(setInputText, "variantId", variantId);
                    updateFormValues(setErrors, "variant", "");
                  }}
                  searchTerm={inputText.variantTitle || ""}
                  onChangeSearchTerm={(text) =>
                    updateFormValues(setInputText, "variantTitle", text)
                  }
                  label={i18n.t("variant")}
                  isSubmitting={false}
                  items={variantOptions}
                  placeholder={i18n.t("variantPlaceholder")}
                  disableFiltering={false}
                  showDropdownIcon={canEdit && variantOptions.length !== 0}
                  showNoResult={false}
                  disableAutoSelect={false}
                  paddingRightIcon={responsiveSize.horizontal(-8)}
                  error={errors.variant}
                  setError={(value) => updateFormValues(setErrors, "variant", value)}
                  scrollViewRef={scrollRef}
                  maxLength={40}
                  setScrollSpace={setScrollSpace}
                />
              </View>
            </Pressable>
          </View>

          {/* Barcode readonly */}
          {barcode && (
            <ThemedView>
              <Pressable
                onPress={() =>
                  setTemporaryError(
                    setErrors,
                    "barcode",
                    i18n.t("errors.barcode.BARCODE_CAN_NOT_BE_CHANGED"),
                  )
                }
              >
                <View pointerEvents="none">
                  <UniversalTextInput
                    value={barcode || ""}
                    label={i18n.t("barcode")}
                    editable={false}
                    error={!!errors.barcode}
                    outlineStyle={styles.inputOutlineStyle}
                    style={styles.input}
                    showError={false}
                  />
                </View>
              </Pressable>
              <HelperText
                type="error"
                visible={!!errors.barcode}
                style={styles.helperText}
                theme={inputColor}
              >
                {errors?.barcode}
              </HelperText>
            </ThemedView>
          )}

          {/* Obrazek */}
          <FoodImagePicker
            imageUrl={memoizedImageUrl}
            onPickImage={() => setVisible(true)}
            isLoading={false}
          />
          <ImageSelector
            label={i18n.t("foodPhotoTitle")}
            visible={visible}
            setVisible={setVisible}
            onPress={(type) => handleImagePick(type)}
          />

          {/* Popis */}
          <UniversalTextInput
            value={inputText?.description || ""}
            onChangeText={(text) => {
              updateFormValues(setInputText, "description", text);
              updateFormValues(
                setErrors,
                "description",
                text.length > 200 ? i18n.t("descriptionTooLong") : "",
              );
            }}
            label={i18n.t("description")}
            placeholder={i18n.t("descriptionPlaceholder")}
            error={errors.description}
            multiline={true}
            numberOfLines={Math.round(responsiveSize.vertical(7))}
            maxLength={200}
            outlineStyle={styles.inputOutlineStyle}
            style={[styles.input, { minHeight: responsiveSize.vertical(110) }]}
            contentStyle={styles.descriptionContentStyle}
          />

          {scrollSpace && <View style={{ height: responsiveSize.vertical(300) }} />}
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: responsiveSize.horizontal(14),
    paddingTop: responsiveSize.vertical(14),
    width: "100%",
  },
  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
  inputOutlineStyle: {
    borderRadius: responsiveSize.moderate(7),
  },
  toolTipVariatContainer: {
    position: "relative",
    width: "100%",
    zIndex: 10,
  },
  toolTipContainer: {
    position: "absolute",
    top: responsiveSize.vertical(-3),
    left: responsiveSize.horizontal(-6),
    zIndex: 11,
  },
  toolTipText: {
    fontSize: responsiveFont(13),
    maxWidth: responsiveSize.horizontal(270),
    lineHeight: responsiveVertical(21),
  },
  toolTipHitSlop: {
    top: 15,
    bottom: 20,
    left: 15,
    right: 20,
  },
  helperText: {
    marginLeft: responsiveSize.horizontal(-9),
    marginTop: responsiveSize.vertical(-2),
  },
  descriptionContentStyle: {
    paddingTop: responsiveSize.vertical(8),
    paddingBottom: responsiveSize.vertical(8),
    paddingRight: responsiveSize.horizontal(6),
    textAlignVertical: "top",
  },
});
