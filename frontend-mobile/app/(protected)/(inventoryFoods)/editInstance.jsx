import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { responsiveSize, responsiveFont, responsiveVertical } from "@/utils/scale";
import {
  getDaysUntil,
  getDateFromDays,
  getAmountTexts,
  formatNumberInput,
  validateNumericInput,
  updateFormValues,
  getVariant,
  resetErrors,
  validateInstance,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCallback, useState, useLayoutEffect, useMemo, useRef } from "react";
import { DateInput } from "@/components/input/DateInput";
import { DropdownMenu } from "@/components/input/DropdownMenu";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { ThemedText } from "@/components/themed/ThemedText";
import { SearchableDropdown } from "@/components/input/SearchableDropdown";
import {
  UNIT_OPTIONS,
  CURRENCY_OPTIONS,
  FOOD_MAX_YEAR_EXPIRATION_DATE_IN_FUTURE,
  FOOD_MIN_YEAR_EXPIRATION_DATE_IN_PAST,
} from "@/constants/food";
import { DoubleInputRow } from "@/components/input/DoubleInputRow";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { Stepper } from "@/components/common/Stepper";
import Tooltip from "react-native-walkthrough-tooltip";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useGetFoodVariants } from "@/hooks/queries/food/useGetFoodQuary";
import { useUpdateFoodInstanceMutation } from "@/hooks/queries/instance/useFoodInstanceMutation";
import { handleApiError } from "@/utils/handleApiError";
import { useQueryClient } from "@tanstack/react-query";

export default function EditInstanceScreen() {
  const [scrollSpace, setScrollSpace] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  const updating = useRef(false);

  const params = useLocalSearchParams();
  const { initialData, catalogId, foodId, variantId, variantTitle } = params;

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const navigation = useNavigation();
  const colors = useThemeColor();

  const { updateInstance, isSubmitting } = useUpdateFoodInstanceMutation(
    activeInventory.id,
    catalogId,
  );

  const { data: variants = [] } = useGetFoodVariants(activeInventory.id, catalogId);

  const variantOptions = useMemo(
    () =>
      variants.map((v) => ({
        label: v.variantTitle,
        value: v.variantId.toString(),
      })),
    [variants],
  );

  // parsovani initialData z params
  const parsedItem = useMemo(() => {
    try {
      return JSON.parse(initialData);
    } catch {
      return {};
    }
  }, [initialData]);

  const [inputText, setInputText] = useState({
    quantity: String(parsedItem?.count ?? 1),
    expirationDate: parsedItem?.expirationDate ? new Date(parsedItem.expirationDate) : "",
    days: parsedItem?.expirationDate
      ? String(getDaysUntil(new Date(parsedItem.expirationDate), 50))
      : "",
    amount: parsedItem?.amount ? String(parsedItem.amount) : "",
    unit: parsedItem?.unit ?? "null",
    price: parsedItem?.price ? String(parsedItem.price) : "",
    currency: parsedItem?.currency ?? "CZK",
    variantId: variantId ?? "undefined",
    variantTitle: variantTitle ?? "",
  });

  const [errors, setErrors] = useState({
    amount: "",
    unit: "",
    price: "",
    expirationDate: "",
    variant: "",
  });

  const inputDataRef = useRef(inputText);
  inputDataRef.current = inputText;

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(colors), [colors]);

  const handleSave = useCallback(() => {
    const { current } = inputDataRef;
    if (updating.current || isSubmitting || !validateInstance(errors, setErrors, current)) return;
    resetErrors(setErrors, errors);

    updating.current = true;
    updateInstance.mutate(
      {
        foodInstanceId: parsedItem?.instanceIds.slice(
          parsedItem.instanceIds.length - current?.quantity,
        ),
        expirationDate: current.expirationDate || "",
        amount: parseFloat(current.amount) || 0,
        unit: current.unit === "null" ? "" : (current.unit ?? ""),
        price: parseFloat(current.price?.replace(",", ".")) || 0,
        currency: current.currency,
        ...getVariant(current.variantId, current.variantTitle),
      },
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

          updating.current = false;

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
          updating.current = false;
          handleApiError(error, setErrors, errors, "variant");
        },
      },
    );
  }, [
    isSubmitting,
    errors,
    parsedItem?.instanceIds,
    updateInstance,
    activeInventory.id,
    queryClient,
    foodId,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={isSubmitting || updating.current} onPress={handleSave}>
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isSubmitting || updating.current}
            color={colors}
            text={i18n.t("save")}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors, isSubmitting, handleSave]);

  const handleQuantityChange = useCallback((val) => {
    updateFormValues(setInputText, "quantity", String(val));
  }, []);

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
          {/* Pocet kusu */}
          <Stepper
            label={i18n.t("foodPieceCount")}
            value={Number(inputText.quantity) || 1}
            onChange={handleQuantityChange}
            min={1}
            max={parsedItem?.instanceIds.length}
            containerStyle={{ marginTop: responsiveSize.vertical(9) }}
          />

          {/* Datum expirace a dny */}
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
                  updateFormValues(setErrors, "expirationDate", "");
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

          {/* Mnozstvi a jednotka */}
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

          {/* Cena a mena */}
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

          {/* Varianta a tooltip */}
          <View style={styles.toolTipVariatContainer}>
            <View style={styles.toolTipContainer}>
              <Tooltip
                isVisible={showTooltip}
                content={
                  <ThemedText style={[styles.toolTipText, { color: colors.text }]}>
                    {i18n.t("variantExplanationTip2")}
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

            <SearchableDropdown
              value={inputText.variantId || ""}
              onChange={(variantId) => updateFormValues(setInputText, "variantId", variantId)}
              searchTerm={inputText.variantTitle || ""}
              onChangeSearchTerm={(text) => {
                updateFormValues(setInputText, "variantTitle", text);
                updateFormValues(setErrors, "variant", "");
              }}
              label={i18n.t("variant")}
              isSubmitting={false}
              items={variantOptions}
              placeholder={i18n.t("variantPlaceholder")}
              disableFiltering={false}
              showDropdownIcon={variantOptions.length !== 0}
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
});
