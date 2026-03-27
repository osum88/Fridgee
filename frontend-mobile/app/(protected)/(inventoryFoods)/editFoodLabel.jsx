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
import { responsiveSize } from "@/utils/scale";
import {
  formatNumberInput,
  validateNumericInput,
  updateFormValues,
  setTemporaryError,
  getAmountTexts,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCallback, useState, useLayoutEffect, useMemo, useRef } from "react";
import { useLocalSearchParams, useNavigation, router } from "expo-router";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { DropdownMenu } from "@/components/input/DropdownMenu";
import { DoubleInputRow } from "@/components/input/DoubleInputRow";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { FoodImagePicker } from "@/components/food/FoodImagePicker";
import { useImageUpload } from "@/hooks/image/useImageUpload";
import { useUpdateFoodLabelMutation } from "@/hooks/queries/foodLabel/useFoodLabelMutation";
import { handleApiError } from "@/utils/handleApiError";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { UNIT_OPTIONS } from "@/constants/food";
import { useQueryClient } from "@tanstack/react-query";
import { HelperText } from "react-native-paper";

const validateForm = (setErrors, inputText) => {
  if (!inputText?.title) {
    updateFormValues(setErrors, "labelTitle", i18n.t("errors.labelTitle.STRING_EMPTY"));
    return false;
  }
  const amount = parseFloat(inputText?.amount || "0");
  if (amount > 0 && (inputText?.unit === "null" || !inputText?.unit)) {
    updateFormValues(setErrors, {
      amount: i18n.t("errors.amount.QUANTITY_UNIT_REQUIRED"),
      unit: " ",
    });
    return false;
  }
  if (!validateNumericInput(inputText?.amount, "amount", setErrors, 9999)) {
    return false;
  }

  if (inputText?.price && !validateNumericInput(inputText.price, "price", setErrors, 999999)) {
    return false;
  }
  return true;
};

export default function EditFoodLabelScreen() {
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
    id: foodLabelId,
    title,
    description,
    foodImageUrl: paramFoodImageUrl,
    foodImageCloudId: paramFoodImageCloudId,
    price,
    unit,
    amount,
    barcode,
  } = parsedItem;

  const navigation = useNavigation();
  const colors = useThemeColor();
  const { pickImage, takePhoto, uploadImage } = useImageUpload("back");
  const { mutate: updateFoodLabel, isSubmitting } = useUpdateFoodLabelMutation();

  const [inputText, setInputText] = useState({
    title: title ?? "",
    description: description ?? "",
    foodImageUrl: paramFoodImageUrl ?? "",
    foodImageCloudId: paramFoodImageCloudId ?? "",
    amount: amount ? String(amount) : "",
    unit: unit ?? "null",
    price: price ? String(price) : "",
  });

  const [errors, setErrors] = useState({
    labelTitle: "",
    description: "",
    amount: "",
    unit: "",
    price: "",
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

    const foodLabelData = {
      foodLabelId: parseInt(foodLabelId),
      title: current.title,
      description: current.description || "",
      foodImageUrl: current.foodImageUrl,
      foodImageCloudId: current.foodImageCloudId,
      amount: parseFloat(current.amount) || 0,
      unit: current.unit === "null" ? "" : (current.unit ?? ""),
      price: parseFloat(current.price?.replace(",", ".")) || 0,
    };

    updateFoodLabel(
      { foodLabelData, imageFormData: formData },
      {
        onSuccess: async (response) => {
          const updatedId = response?.data?.id;
          await queryClient.invalidateQueries({ queryKey: ["available-food-labels"] });
          queryClient.invalidateQueries({ queryKey: ["food-label", parseInt(foodLabelId)] });
          if (
            title !== current?.title ||
            description !== current?.description ||
            paramFoodImageUrl !== current?.foodImageUrl
          ) {
            queryClient.invalidateQueries({ queryKey: ["inventory-content"] });
            queryClient.invalidateQueries({ queryKey: ["food-detail"] });
          }
          isUpdating.current = false;

          if (updatedId && updatedId !== parseInt(foodLabelId)) {
            router.dismiss(2);
            router.replace(`/(protected)/(inventoryFoods)/foodLabelDetail/${updatedId}`);
          } else {
            router.back();
          }
        },
        onError: (error) => {
          isUpdating.current = false;
          handleApiError(error, setErrors, errors, "barcode");
        },
      },
    );
  }, [
    isSubmitting,
    errors,
    foodLabelId,
    formData,
    updateFoodLabel,
    description,
    queryClient,
    title,
    paramFoodImageUrl,
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
          {/* Barcode readonly */}

          <ThemedView>
            <Pressable
              onPress={() =>
                setTemporaryError(
                  setErrors,
                  "barcode",
                  barcode
                    ? i18n.t("errors.barcode.BARCODE_CAN_NOT_BE_CHANGED")
                    : i18n.t("errors.barcode.BARCODE_EMPTY_CAN_NOT_BE_CHANGED"),
                  3000,
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

          {/* Nazev */}
          <UniversalTextInput
            value={inputText.title || ""}
            onChangeText={(text) => {
              updateFormValues(setInputText, "title", text);
              updateFormValues(setErrors, "labelTitle", "");
            }}
            label={i18n.t("foodName")}
            maxLength={100}
            placeholder={i18n.t("enterFoodName")}
            inputColor={inputColor}
            error={errors.labelTitle}
            setError={(value) => updateFormValues(setErrors, "labelTitle", value)}
          />

          {/* Mnozstvi a jednotka */}
          <DoubleInputRow
            ratio={[1, 1]}
            error={errors.amount}
            inputColor={inputColor}
            leftComponent={
              <UniversalTextInput
                value={inputText?.amount || ""}
                onChangeText={(val) => {
                  const numeric = formatNumberInput(val);
                  if (numeric === undefined) return;
                  updateFormValues(setInputText, "amount", numeric);
                  validateNumericInput(val, "amount", setErrors, 9999);
                }}
                keyboardType="numeric"
                maxLength={7}
                label={getAmountTexts(unit)?.label}
                placeholder={"0"}
                error={errors.amount}
                showError={false}
                outlineStyle={styles.inputOutlineStyle}
                style={styles.input}
              />
            }
            rightComponent={
              <DropdownMenu
                value={inputText.unit || ""}
                onChange={(unit) => updateFormValues(setInputText, "unit", unit)}
                label={i18n.t("unit")}
                isSubmitting={true}
                items={UNIT_OPTIONS}
                placeholder={i18n.t("selectUnit")}
                paddingRightIcon={responsiveSize.horizontal(6)}
                showError={false}
                error={errors.unit}
                setError={(value) => updateFormValues(setErrors, "unit", value)}
              />
            }
          />

          {/* Cena */}
          <UniversalTextInput
            value={inputText?.price || ""}
            onChangeText={(val) => {
              const formatted = formatNumberInput(val);
              if (formatted === undefined) return;
              updateFormValues(setInputText, "price", formatted);
              validateNumericInput(val, "price", setErrors, 999999);
            }}
            keyboardType="numeric"
            maxLength={9}
            label={i18n.t("price")}
            placeholder={"0"}
            error={errors.price}
            outlineStyle={styles.inputOutlineStyle}
            style={styles.input}
          />

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
                text.length > 250 ? i18n.t("descriptionTooLong") : "",
              );
            }}
            label={i18n.t("description")}
            placeholder={i18n.t("descriptionPlaceholder")}
            error={errors.description}
            multiline={true}
            numberOfLines={Math.round(responsiveSize.vertical(7))}
            maxLength={250}
            outlineStyle={styles.inputOutlineStyle}
            style={[styles.input, { minHeight: responsiveSize.vertical(110) }]}
            contentStyle={styles.descriptionContentStyle}
          />
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
  descriptionContentStyle: {
    paddingTop: responsiveSize.vertical(8),
    paddingBottom: responsiveSize.vertical(8),
    paddingRight: responsiveSize.horizontal(6),
    textAlignVertical: "top",
  },
});
