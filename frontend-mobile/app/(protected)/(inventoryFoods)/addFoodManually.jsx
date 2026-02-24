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
  getCategoryIdByVariant,
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
import { UNIT_OPTIONS, CURRENCY_OPTIONS } from "@/constants/food";
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
import useUpdateProfile from "@/hooks/queries/user/useUpdateProfile";

export default function AddFoodManually() {
  const color = useThemeColor();
  const { userId } = useUser();
  const [categories, setCategories] = useState([{ label: i18n.t("noCategory"), value: "null" }]);
  const [variants, setVariants] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [inventoryId, setInventoryId] = useState(19);
  const [lockCategory, setLockCategory] = useState(false);
  const [scrollSpace, setScrollSpace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [image, setImage] = useState(null);
  const [visible, setVisible] = useState(false);
  const { pickImage, takePhoto, uploadImage } = useImageUpload("back");
  const navigation = useNavigation();
  const scrollRef = useRef(null);


  const { updateProfile, isSubmitting } = useUpdateProfile();


  const [inputText, setInputText] = useState({
    inventoryId: "",
    // barcode: "",

    // catalogId: "",
    categoryId: "null",

    variantId: "",
    variantTitle: "",

    title: "",
    // description: "",
    // currency: "",
    // foodImageUrl: "",
    // foodImageCloudId: "",
    // amount: "",
    unit: "null",
    quantity: "1",
    // price: "",
    // expirationDate: "",
  });
  const [errors, setErrors] = useState({
    title: "",
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

  const { data: userData } = useGetUserQuery(userId);
  const { data: inventoryCategories } = useGetInventoryCategoriesQuery(inventoryId);

  // nastaveni defaultni meny podle zeme uzivatele
  useEffect(() => {
    if (currency && !inputText.currency) {
      setInputText((prev) => ({ ...prev, currency }));
    }
  }, [currency, inputText.currency]);

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
      setInputText((prev) => ({ ...prev, variantId: "undefined", variantTitle: "" }));
    }
    setInputText((prev) => ({
      ...prev,
      amount: selectedCatalog?.amount?.toString() || "0",
      barcode: selectedCatalog?.barcode || "",
      catalogId: selectedCatalog?.catalogId || undefined,
      description: selectedCatalog?.description || "",

      foodImageCloudId: selectedCatalog?.foodImageCloudId || null,
      foodImageUrl: selectedCatalog?.foodImageUrl || "",
      price: selectedCatalog?.price?.toString() || "0",
      unit: selectedCatalog?.unit || "null",
    }));
  }, [selectedCatalog]);

  useEffect(() => {
    if (!selectedCatalog) {
      setLockCategory(false);
      setErrors((prev) => ({ ...prev, categoryId: "" }));
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
      setInputText((prev) => ({ ...prev, categoryId: resolvedCategory }));
      setLockCategory(true);
    } else {
      setErrors((prev) => ({ ...prev, categoryId: "" }));
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

  const handleImagePick = async (type) => {
    if (type === "camera") {
      const uri = await takePhoto();
      if (uri) {
        setImage(uri);
        const { formData } = await uploadImage(uri);
        console.log(formData, "form");
      }
    } else if (type === "photo") {
      const uri = await pickImage();
      if (uri) {
        setImage(uri);
        const { formData } = await uploadImage(uri);
        console.log(formData, "form");
      }
    } else if (type === "remove") {
      setImage(null);
      setInputText((prev) => ({ ...prev, foodImageUrl: "" }));
    }
  };

  //nastavi tlacitko ulozit v headeru
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            console.log("1");
            if (inputText["bankNumber"] && !isSubmitting) {
              console.log("2");

              if (inputText.birthDate) {
                setErrors((prev) => ({
                  ...prev,
                  birthDate: i18n.t("errorBirthDateInFuture"),
                }));
                return;
              }
              if (!inputText.gender) {
                inputText.gender = "UNSPECIFIED";
              }
              if (inputText.bankNumber && !inputText.country) {
                setErrors((prev) => ({
                  ...prev,
                  country: " ",
                  bankNumber: i18n.t("errorBankNumberNeedCountry"),
                }));
              }
              let bankNumberWasDeleted = false;
              if (!inputText.bankNumber) {
                delete inputText.bankNumber;
                bankNumberWasDeleted = true;
              }
              updateProfile.mutate(inputText, {
                onSuccess: () => {
                  if (bankNumberWasDeleted) {
                  }
                  setErrors((prev) => ({
                    ...prev,
                    name: "",
                    surname: "",
                    birthDate: "",
                    gender: "",
                    country: "",
                    bankNumber: "",
                  }));

                  // isSaving.current = true;
                  navigation.goBack();
                },

                onError: (error) => {
                  const errorMap = {
                    name: "name",
                    surname: "surname",
                    birthDate: "birthDate",
                    gender: "gender",
                    country: "country",
                    bankNumber: "bankNumber",
                  };

                  if (errorMap[error.type]) {
                    setErrors((prev) => ({
                      ...prev,
                      [error.type]: error.message,
                    }));
                  } else {
                    setErrors((prev) => ({
                      ...prev,
                      name: " ",
                      surname: " ",
                      birthDate: " ",
                      gender: " ",
                      country: " ",
                      bankNumber: error.message || i18n.t("errorDefault"),
                    }));
                  }
                },
              });
            }
          }}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={color.text} />
          ) : (
            <ThemedText
              style={{
                color: color.text,
                fontSize: responsiveSize.moderate(18),
                fontWeight: "600",
              }}
            >
              {i18n.t("add")}
            </ThemedText>
          )}
        </TouchableOpacity>
      ),
    });
  }, [navigation, color, inputText]);

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
            setInputText={(text) => setInputText((prev) => ({ ...prev, title: text }))}
            inventoryId={inventoryId}
            setSelectedCatalog={setSelectedCatalog}
            error={errors.title}
            setError={(value) => setErrors((prev) => ({ ...prev, title: value }))}
            maxLength={100}
          />
          {/* pocet kusu pro pridani */}
          <Stepper
            label={i18n.t("quantity") || "1"}
            value={Number(inputText.quantity) || 1}
            onChange={(val) => setInputText((prev) => ({ ...prev, quantity: val }))}
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
                  setInputText((prev) => ({
                    ...prev,
                    expirationDate: date,
                    days: String(getDaysUntil(date, 50)),
                  }))
                }
                maxYearsInFuture={100}
                minYearsInPast={50}
                error={errors.expirationDate}
                setError={(value) => setErrors((prev) => ({ ...prev, expirationDate: value }))}
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

                  setInputText((prev) => ({
                    ...prev,
                    days: numericDays,
                    expirationDate: getDateFromDays(numericDays),
                  }));
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
                  setInputText((prev) => ({ ...prev, amount: numericAmount }));
                  validateNumericInput(amount, "amount", setErrors, 9999);
                }}
                keyboardType="numeric"
                maxLength={7}
                label={getAmountTexts(inputText.unit)?.label}
                placeholder={getAmountTexts(inputText.unit)?.placeholder}
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
                onChange={(unit) => setInputText({ ...inputText, unit: unit })}
                label={i18n.t("unit")}
                isSubmitting={true}
                items={UNIT_OPTIONS}
                placeholder={i18n.t("selectUnit")}
                paddingRightIcon={responsiveSize.horizontal(6)}
                showError={false}
                error={errors.unit}
                setError={(value) => setErrors((prev) => ({ ...prev, unit: value }))}
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
                  setInputText((prev) => ({ ...prev, price: formattedPrice }));
                  validateNumericInput(price, "price", setErrors, 999999);
                }}
                keyboardType="numeric"
                maxLength={9}
                label={i18n.t("price")}
                placeholder={i18n.t("enterPrice")}
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
                onChange={(currency) => setInputText({ ...inputText, currency: currency })}
                label={i18n.t("currency")}
                isSubmitting={true}
                items={CURRENCY_OPTIONS}
                paddingRightIcon={responsiveSize.horizontal(6)}
                showError={false}
              />
            }
          />

          {/* tool tip k variante */}
          <View style={{ position: "relative", width: "100%", zIndex: 10 }}>
            <View
              style={{
                position: "absolute",
                top: responsiveSize.vertical(-3),
                left: responsiveSize.horizontal(-6),
                zIndex: 11,
              }}
            >
              <Tooltip
                isVisible={showTooltip}
                content={
                  <ThemedText
                    style={{
                      color: color.text,
                      fontSize: responsiveFont(13),
                      maxWidth: responsiveSize.horizontal(270),
                      lineHeight: responsiveVertical(21),
                    }}
                  >
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
                  hitSlop={{ top: 15, bottom: 20, left: 15, right: 20 }}
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
                console.log(variantId, "varid");
                setInputText((prev) => ({
                  ...prev,
                  variantId: variantId,
                }));
              }}
              searchTerm={inputText.variantTitle || ""}
              onChangeSearchTerm={(text) => {
                setInputText((prev) => ({ ...prev, variantTitle: text }));
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
              setError={(value) => setErrors((prev) => ({ ...prev, variant: value }))}
              scrollViewRef={scrollRef}
              maxLength={40}
              setScrollSpace={setScrollSpace}
            />
          </View>

          {/* kategorie */}
          <Pressable
            onPress={() =>
              setErrors((prev) => ({
                ...prev,
                categoryId:
                  lockCategory && !errors.categoryId ? i18n.t("errorCategoryChangeNotAllowed") : "",
              }))
            }
          >
            <View pointerEvents={lockCategory ? "none" : "auto"}>
              <DropdownMenu
                value={inputText.categoryId || ""}
                onChange={(category) => setInputText({ ...inputText, categoryId: category })}
                label={i18n.t("category")}
                isSubmitting={!lockCategory}
                items={categories}
                placeholder={i18n.t("selectCategory")}
                paddingRightIcon={responsiveSize.horizontal(6)}
                error={errors.categoryId}
                setError={(value) => setErrors((prev) => ({ ...prev, categoryId: value }))}
                maxHeight={130}
              />
            </View>
          </Pressable>
          {/* barcode pouze pro zobrazeni */}
          {inputText?.barcode && (
            <ThemedView>
              <Pressable
                onPress={() =>
                  setErrors((prev) => ({
                    ...prev,
                    barcode: errors.barcode ? "" : i18n.t("barcodeImmutable"),
                  }))
                }
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
                style={{
                  marginLeft: responsiveSize.horizontal(-9),
                  marginTop: responsiveSize.vertical(-2),
                }}
                theme={inputColor}
              >
                {errors?.barcode}
              </HelperText>
            </ThemedView>
          )}
          <FoodImagePicker
            imageUrl={image || inputText.foodImageUrl}
            onPickImage={() => setVisible(true)}
            isLoading={false}
          />
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
              setInputText((prev) => ({ ...prev, description: text }));
              if (text.length <= 250) {
                setErrors((prev) => ({ ...prev, description: "" }));
              } else {
                setErrors((prev) => ({ ...prev, description: i18n.t("descriptionTooLong") }));
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
            contentStyle={{
              paddingTop: responsiveSize.vertical(8),
              paddingBottom: responsiveSize.vertical(8),
              paddingRight: responsiveSize.horizontal(6),
              textAlignVertical: "top",
            }}
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
});
