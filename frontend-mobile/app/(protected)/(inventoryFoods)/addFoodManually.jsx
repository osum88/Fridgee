import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { CheckableItem } from "@/components/common/CheckableItem";
import i18n from "@/constants/translations";
import { ImageSelector } from "@/components/image/ImageSelector";

import { useTheme } from "@/contexts/ThemeContext";
import {
  responsiveSize,
  responsiveFont,
  responsivePadding,
  responsiveVertical,
} from "@/utils/scale";
import {
  getDaysUntil,
  getDateFromDays,
  getAmountTexts,
  getCurrency,
  formatNumberInput,
  validateNumericInput,
  updateFormValues,
  getCategoryIdByVariant,
  setTemporaryError,
  resetErrors,
  highlightErrorsWithDefault,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import {
  useCallback,
  useState,
  seEffect,
  useLayoutEffect,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { TextInput, HelperText, ActivityIndicator } from "react-native-paper";
import { DateInput } from "@/components/input/DateInput";
import { DropdownMenu } from "@/components/input/DropdownMenu";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SecretInput } from "@/components/input/SecretInput";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { ThemedText } from "@/components/themed/ThemedText";
import { SearchableDropdown } from "../../../components/input/SearchableDropdown";
import { FoodSearchableDropdown } from "@/components/food/FoodSearchableDropdown";
import {
  UNIT_OPTIONS,
  CURRENCY_OPTIONS,
  FOOD_MAX_YEAR_EXPIRATION_DATE_IN_FUTURE,
  FOOD_MIN_YEAR_EXPIRATION_DATE_IN_PAST,
} from "@/constants/food";
import { DoubleInputRow } from "@/components/input/DoubleInputRow";
import { useUser } from "@/hooks/useUser";
import { useGetUserQuery } from "@/hooks/queries/user/useUserQuery";
import { useGetInventoryCategoriesQuery } from "@/hooks/queries/inventory/useInventoryQuary";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import { UniversalTextInput } from "../../../components/input/UniversalTextInput";
import { Stepper } from "../../../components/common/Stepper";
import Tooltip from "react-native-walkthrough-tooltip";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { FoodImagePicker } from "@/components/food/FoodImagePicker";
import { useImageUpload } from "@/hooks/image/useImageUpload";
import useAddFoodMutation from "@/hooks/queries/food/useAddFoodMutation";
import { handleApiError } from "@/utils/handleApiError";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { SaveButtonContent } from "../../../components/button/SaveContentButton";
import { JumpingDots } from "../../../components/animated/JumpingDots";

export default function AddFoodManually() {
  const [categories, setCategories] = useState([{ label: i18n.t("noCategory"), value: "null" }]);
  const [variants, setVariants] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [inventoryId, setInventoryId] = useState(19);
  const [lockCategory, setLockCategory] = useState(false);
  const [scrollSpace, setScrollSpace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [image, setImage] = useState(null);
  const [formData, setFormData] = useState(null);
  const [visible, setVisible] = useState(false);
  const scrollRef = useRef(null);
  const isSaving = useRef(false);

  const PADDING_FOR_DROPDOWN_MENU = 300;

  const navigation = useNavigation();
  const { userId } = useUser();
  const color = useThemeColor();
  const { pickImage, takePhoto, uploadImage } = useImageUpload("back");
  const { addFood, isSubmitting } = useAddFoodMutation();
  const { data: userData } = useGetUserQuery(userId);
  const { data: inventoryCategories } = useGetInventoryCategoriesQuery(inventoryId);

  const inputDataRef = useRef(inputText);

  const [inputText, setInputText] = useState({
    categoryId: "null",
    variantId: "",
    variantTitle: "",
    title: "",
    unit: "null",
    quantity: "1",
  });
  const [errors, setErrors] = useState({
    labelTitle: "",
    description: "",
    foodImageUrl: "",
    amount: "",
    unit: "",
    price: "",
    expirationDate: "",
    variant: "",
    barcode: "",
    categoryId: "",
  });

  // zabrani rerenderu prepareFoodData
  useEffect(() => {
    inputDataRef.current = inputText;
  }, [inputText]);

  // nastaveni defaultni meny podle zeme uzivatele
  useEffect(() => {
    if (currency && !inputText.currency) {
      updateFormValues(setInputText, "currency", currency);
    }
  }, [currency, inputText.currency]);

  //pri zmene katalogu se resetuji inputy nebo nastavi na data z catalogu
  useEffect(() => {
    if (selectedCatalog?.variants) {
      console.log("2");
      const variantOptions = selectedCatalog.variants.map((variant) => ({
        label: variant.variantTitle,
        value: variant.variantId.toString(),
      }));
      setVariants(variantOptions);
    } else {
      setVariants([]);
    }
    if (inputText.variantId) {
      updateFormValues(setInputText, { variantId: "undefined", variantTitle: "" });
    }
    setInputText((prev) => ({
      ...prev,
      amount: selectedCatalog?.amount?.toString() || "",
      barcode: selectedCatalog?.barcode || "",
      catalogId: selectedCatalog?.catalogId || undefined,
      description: selectedCatalog?.description || "",
      foodImageCloudId: selectedCatalog?.foodImageCloudId || "",
      foodImageUrl: selectedCatalog?.foodImageUrl || "",
      price: selectedCatalog?.price?.toString() || "",
      unit: selectedCatalog?.unit || "null",
    }));
  }, [selectedCatalog]);

  //uzamyka category pokud existuje shoda z jiz existujicim food
  useEffect(() => {
    if (!selectedCatalog) {
      setLockCategory(false);
      updateFormValues(setErrors, "categoryId", "");
      return;
    }
    // pokud existuje varianta s tímto variantId, je to existujíci varianta
    const isExistingVariant = variants.some((v) => v.value === inputText.variantId);
    // pokud neni vybrana zadna varianta nebo uzivatel pise nouvou
    const isDefaultVariant = !inputText.variantId || inputText.variantId === "undefined";
    // najde kategorii
    const resolvedCategory = getCategoryIdByVariant(selectedCatalog, inputText.variantId);
    // overi jestli pro null existuje varianta
    const hasStrictDefault = selectedCatalog.existingItems?.some((item) => item.variantId === null);

    if (isExistingVariant || (isDefaultVariant && hasStrictDefault && !inputText.variantTitle)) {
      updateFormValues(setInputText, "categoryId", resolvedCategory);
      setLockCategory(true);
    } else {
      updateFormValues(setErrors, "categoryId", "");
      setLockCategory(false);
    }
  }, [selectedCatalog, inputText.variantId, inputText.variantTitle, variants]);

  // nastaveni kategorii pro dropdown menu, pokud je pouze jedna kategorie, nastavi ji jako defaultni
  useEffect(() => {
    if (categories?.length <= 1 && inventoryCategories?.data) {
      console.log("3");

      const categoriesOptions = [
        { label: i18n.t("noCategory"), value: "null" },
        ...inventoryCategories.data.map((cat) => ({
          label: cat.title,
          value: cat.id.toString(),
        })),
      ];
      setCategories(categoriesOptions);
    }
  }, [inventoryCategories]);

  //defaultni mena uzivatele
  const currency = useMemo(() => {
    if (!userData?.data?.country) return "CZK";
    return getCurrency(userData.data.country);
  }, [userData?.data?.country]);

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(color), [color]);

  //rozhoduje co se stane pri vyberu fotky
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
    [takePhoto, pickImage, uploadImage, setInputText],
  );

  //zobrazeni obrazku
  const memoizedImageUrl = useMemo(() => {
    //lokalne vybrany obrazek
    if (image) return image;

    if (inputText.foodImageUrl) {
      const isFullUrl = inputText.foodImageUrl.startsWith("http");
      return isFullUrl
        ? inputText.foodImageUrl
        : `${IMAGEKIT_URL_ENDPOINT}${inputText.foodImageUrl}`;
    }
    return "";
  }, [image, inputText.foodImageUrl]);

  // Pomocná funkce pro přípravu dat (Data Mapper)
  const prepareFoodData = useCallback(() => {
    const currentInput = inputDataRef.current;
    console.log(currentInput);
    const {
      variantId,
      variantTitle,
      foodImageCloudId,
      foodImageUrl,
      catalogId,
      categoryId,
      ...rest
    } = currentInput;

    // Vyčištění variant
    const getVariant = () => {
      if (variantId && variantId !== "undefined") return { variantId, variantTitle };
      if (variantTitle) return { variantTitle };
      return {};
    };

    // Vyčištění obrázků
    const getImage = () => {
      if (foodImageCloudId && foodImageUrl) return { foodImageCloudId, foodImageUrl };
      if (foodImageUrl === "" && foodImageCloudId === "null") return { foodImageUrl: "" };
      return {};
    };

    const getCatalogId = catalogId ? { catalogId } : {};

    const getCategoryId = !categoryId || categoryId === "null" ? {} : { categoryId };

    return {
      ...rest,
      inventoryId,
      unit: rest?.unit === "null" ? "" : rest.unit || "",
      price: rest?.price || 0,
      amount: rest?.amount || 0,
      ...getCatalogId,
      ...getCategoryId,
      ...getVariant(),
      ...getImage(),
    };
  }, [inventoryId]);

  const validateForm = useCallback(() => {
    if (!inputText?.title) {
      updateFormValues(setErrors, "labelTitle", i18n.t("errors.labelTitle.STRING_EMPTY"));
      return false;
    }
    if (errors?.expirationDate) return false;

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

    if (inputText?.price && !validateNumericInput(inputText?.price, "price", setErrors, 999999)) {
      return false;
    }

    return true;
  }, [inputText, errors]);

  //nastavi tlacitko ulozit v headeru
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          disabled={isSubmitting}
          onPress={() => {
            if (isSubmitting || !validateForm()) return;
            const foodData = prepareFoodData();
            resetErrors(setErrors, errors);

            console.log("foodDate", foodData);
            console.log("formData", formData);

            addFood.mutate(
              { foodData: foodData, imageFormData: formData },
              {
                onSuccess: () => {
                  isSaving.current = true;
                  resetErrors(setErrors, errors);
                  navigation.goBack();
                },
                onError: (error) => {
                  handleApiError(error, setErrors, errors, "labelTitle");
                },
              },
            );
          }}
        >
          <SaveButtonContent
            isSubmitting={isSubmitting}
            color={color}
            text={"add"}
          ></SaveButtonContent>
        </TouchableOpacity>
      ),
    });
  }, [navigation, color, addFood, errors, formData, isSubmitting, validateForm, prepareFoodData]);

  // console.log("categorieswwww", categories);
  // console.log("selectedCatalog", selectedCatalog);
  // console.log("existingItems", selectedCatalog?.existingItems);
  // console.log(inputText);
  // console.log(inputText.categoryId, "catid");
  // console.log(lockCategory, "lockCategory");
  // console.log("variant", variants);
  console.log("textinput", inputText);

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
        {/* TODO  vyresit jak udelat aby to mohl prepsat*/}
        <ThemedView safe={true} style={[styles.contentWrapper]}>
          {/* nazev potraviny */}
          <FoodSearchableDropdown
            inputText={inputText.title}
            setInputText={(text) => updateFormValues(setInputText, "title", text)}
            inventoryId={inventoryId}
            setSelectedCatalog={setSelectedCatalog}
            error={errors.labelTitle}
            setError={(value) => updateFormValues(setErrors, "labelTitle", value)}
            maxLength={100}
          />
          {/* pocet kusu pro pridani */}
          <Stepper
            label={i18n.t("quantity") || "1"}
            value={Number(inputText.quantity) || 1}
            onChange={(val) => updateFormValues(setInputText, "quantity", val)}
            min={1}
            containerStyle={{ marginTop: responsiveSize.vertical(9) }}
          />
          {/* datum expirace */}
          <DoubleInputRow
            ratio={[7, 3]}
            error={errors.expirationDate}
            inputColor={inputColor}
            leftComponent={
              <DateInput
                value={inputText?.expirationDate}
                label={i18n.t("expirationDate")}
                onChange={(date) =>
                  updateFormValues(setInputText, {
                    expirationDate: date,
                    days: String(getDaysUntil(date, 50)),
                  })
                }
                maxYearsInFuture={FOOD_MAX_YEAR_EXPIRATION_DATE_IN_FUTURE}
                minYearsInPast={FOOD_MIN_YEAR_EXPIRATION_DATE_IN_PAST}
                error={errors.expirationDate}
                setError={(value) => updateFormValues(setErrors, "expirationDate", value)}
                showError={false}
              />
            }
            //  dny
            rightComponent={
              <UniversalTextInput
                value={inputText?.days || ""}
                onChangeText={(days) => {
                  let numericDays = days.replace(/[^0-9-]/g, "");

                  if (numericDays !== "" && numericDays !== "-") {
                    const maxLength = numericDays.startsWith("-") ? 5 : 4;
                    if (numericDays.length > maxLength) {
                      numericDays = numericDays.slice(0, maxLength);
                    }
                  }
                  updateFormValues(setInputText, {
                    days: numericDays,
                    expirationDate: getDateFromDays(numericDays),
                  });
                }}
                keyboardType="numeric"
                label={i18n.t("days")}
                error={errors.expirationDate}
                outlineStyle={styles.inputOutlineStyle}
                style={styles.input}
                showError={false}
              />
            }
          />

          {/* mnozstvi */}
          <DoubleInputRow
            ratio={[1, 1]}
            error={errors.amount}
            inputColor={inputColor}
            leftComponent={
              <UniversalTextInput
                value={inputText?.amount || ""}
                onChangeText={(amount) => {
                  const numericAmount = formatNumberInput(amount);
                  if (numericAmount === undefined) return;
                  updateFormValues(setInputText, "amount", numericAmount);
                  validateNumericInput(amount, "amount", setErrors, 9999);
                }}
                keyboardType="numeric"
                maxLength={7}
                label={getAmountTexts(inputText.unit)?.label}
                placeholder={"0"}
                error={errors.amount}
                showError={false}
                outlineStyle={styles.inputOutlineStyle}
                style={styles.input}
              />
            }
            //  jednotky
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
          {/* cena */}
          <DoubleInputRow
            ratio={[7, 3]}
            error={errors.price}
            inputColor={inputColor}
            leftComponent={
              <UniversalTextInput
                value={inputText?.price || ""}
                onChangeText={(price) => {
                  const formattedPrice = formatNumberInput(price);
                  if (formattedPrice === undefined) return;
                  updateFormValues(setInputText, "price", formattedPrice);
                  validateNumericInput(price, "price", setErrors, 999999);
                }}
                keyboardType="numeric"
                maxLength={9}
                label={i18n.t("price")}
                placeholder={"0"}
                error={errors.price}
                outlineStyle={styles.inputOutlineStyle}
                style={styles.input}
                showError={false}
              />
            }
            //  měna
            rightComponent={
              <DropdownMenu
                value={inputText.currency || ""}
                onChange={(currency) => updateFormValues(setInputText, "currency", currency)}
                label={i18n.t("currency")}
                isSubmitting={true}
                items={CURRENCY_OPTIONS}
                paddingRightIcon={responsiveSize.horizontal(6)}
                showError={false}
              />
            }
          />

          {/* tool tip k variante */}
          <View style={styles.toolTipVariatContainer}>
            <View style={styles.toolTipContainer}>
              <Tooltip
                isVisible={showTooltip}
                content={
                  <ThemedText style={[styles.toolTipText, { color: color.text }]}>
                    {i18n.t("variantExplanationTip")}
                  </ThemedText>
                }
                placement="top"
                contentStyle={{ backgroundColor: color.surface, borderRadius: 8 }}
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
                      color={color.inputIcon}
                    />
                  </ThemedView>
                </TouchableOpacity>
              </Tooltip>
            </View>
            {/* varianta */}
            <SearchableDropdown
              value={inputText.variantId || ""}
              onChange={(variantId) => {
                updateFormValues(setInputText, "variantId", variantId);
              }}
              searchTerm={inputText.variantTitle || ""}
              onChangeSearchTerm={(text) => {
                updateFormValues(setInputText, "variantTitle", text);
              }}
              label={i18n.t("variant")}
              isSubmitting={false}
              items={variants}
              placeholder={i18n.t("variantPlaceholder")}
              disableFiltering={false}
              showDropdownIcon={variants.length !== 0}
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

          {/* kategorie */}
          <Pressable
            onPress={() => {
              if (lockCategory) {
                setTemporaryError(setErrors, "categoryId", i18n.t("errorCategoryChangeNotAllowed"));
              }
            }}
          >
            <View pointerEvents={lockCategory ? "none" : "auto"}>
              <DropdownMenu
                value={inputText.categoryId || ""}
                onChange={(category) => updateFormValues(setInputText, "categoryId", category)}
                label={i18n.t("category")}
                isSubmitting={!lockCategory}
                items={categories}
                placeholder={i18n.t("selectCategory")}
                paddingRightIcon={responsiveSize.horizontal(6)}
                error={errors.categoryId}
                setError={(value) => updateFormValues(setErrors, "categoryId", value)}
                maxHeight={130}
              />
            </View>
          </Pressable>
          {/* barcode pouze pro zobrazeni */}
          {inputText?.barcode && (
            <ThemedView>
              <Pressable
                onPress={() => setTemporaryError(setErrors, "barcode", i18n.t("barcodeImmutable"))}
              >
                <View pointerEvents="none">
                  <UniversalTextInput
                    value={inputText?.barcode || ""}
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
          {/* obrazek */}
          <FoodImagePicker
            imageUrl={memoizedImageUrl}
            onPickImage={() => setVisible(true)}
            isLoading={false}
          />
          {/* modalni okno pro vyber akce obrazku */}
          <ImageSelector
            label={i18n.t("foodPhotoTitle")}
            visible={visible}
            setVisible={setVisible}
            onPress={(type) => handleImagePick(type)}
          />
          {/* popisek/poznamka */}
          <UniversalTextInput
            value={inputText?.description || ""}
            onChangeText={(text) => {
              updateFormValues(setInputText, "description", text);
              if (text.length <= 250) {
                updateFormValues(setErrors, "description", "");
              } else {
                updateFormValues(setErrors, "description", i18n.t("descriptionTooLong"));
              }
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
          {scrollSpace && (
            <View style={{ height: responsiveSize.vertical(PADDING_FOR_DROPDOWN_MENU) }} />
          )}
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
    paddingHorizontal: responsiveSize.horizontal(22),
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
