import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import {
  getDaysUntil,
  getDateFromDays,
  getAmountTexts,
  formatNumberInput,
  validateNumericInput,
  resetErrors,
  updateFormValues,
  validateInstance,
  getCurrency,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCallback, useState, useLayoutEffect, useMemo, useRef } from "react";
import { DateInput } from "@/components/input/DateInput";
import { DropdownMenu } from "@/components/input/DropdownMenu";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import {
  UNIT_OPTIONS,
  CURRENCY_OPTIONS,
  FOOD_MAX_YEAR_EXPIRATION_DATE_IN_FUTURE,
  FOOD_MIN_YEAR_EXPIRATION_DATE_IN_PAST,
} from "@/constants/food";
import { DoubleInputRow } from "@/components/input/DoubleInputRow";
import { UniversalTextInput } from "@/components/input/UniversalTextInput";
import { Stepper } from "@/components/common/Stepper";
import { SaveButtonContent } from "@/components/button/SaveButtonContent";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { useAddFoodInstanceMutation } from "@/hooks/queries/instance/useFoodInstanceMutation";
import { handleApiError } from "@/utils/handleApiError";
import { useQueryClient } from "@tanstack/react-query";
import { useGetUserQuery } from "@/hooks/queries/user/useUserQuery";
import { useUser } from "@/hooks/useUser";

export default function AddInstanceScreen() {
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();
  const adding = useRef(false);

  const params = useLocalSearchParams();
  const { foodId, catalogId } = params;

  const activeInventory = useInventoryStore((state) => state.activeInventory);
  const navigation = useNavigation();
  const colors = useThemeColor();
  const { userId } = useUser();

  const { addInstance, isSubmitting } = useAddFoodInstanceMutation(activeInventory.id);
  const { data: userData } = useGetUserQuery(userId);

  // nastaveni defaultni meny podle zeme uzivatele
  const defaultCurrency = userData?.data?.country ? getCurrency(userData.data.country) : "CZK";

  const [inputText, setInputText] = useState({
    quantity: "1",
    expirationDate: "",
    days: "",
    amount: "",
    unit: "null",
    price: "",
    currency: defaultCurrency,
  });

  const [errors, setErrors] = useState({
    amount: "",
    unit: "",
    price: "",
    expirationDate: "",
  });

  const inputDataRef = useRef(inputText);
  inputDataRef.current = inputText;

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(colors), [colors]);

  const handleSave = useCallback(() => {
    const { current } = inputDataRef;
    if (adding.current || isSubmitting || !validateInstance(errors, setErrors, current)) return;
    resetErrors(setErrors, errors);
    adding.current = true;
    addInstance.mutate(
      {
        foodId: parseInt(foodId),
        quantity: parseInt(current.quantity) || 1,
        expirationDate: current.expirationDate || "",
        amount: parseFloat(current.amount) || 0,
        unit: current.unit === "null" ? "" : (current.unit ?? ""),
        price: parseFloat(current.price?.replace(",", ".")) || 0,
        currency: current.currency,
      },
      {
        onSuccess: async () => {
          resetErrors(setErrors, errors);
          queryClient.invalidateQueries({
            queryKey: ["inventory-content", parseInt(activeInventory.id)],
          });
          queryClient.refetchQueries({
            queryKey: [
              "food-detail",
              parseInt(activeInventory.id),
              parseInt(catalogId),
              parseInt(foodId),
            ],
            exact: true,
          });
          adding.current = false;
          navigation.goBack();
        },
        onError: (error) => {
          adding.current = false;
          handleApiError(error, setErrors, errors, "price");
        },
      },
    );
  }, [
    isSubmitting,
    errors,
    addInstance,
    navigation,
    activeInventory.id,
    queryClient,
    catalogId,
    foodId,
  ]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity disabled={isSubmitting || adding.current} onPress={handleSave}>
          <SaveButtonContent
            key={`header-save-${colors.background}`}
            isSubmitting={isSubmitting || adding.current}
            color={colors}
            text={i18n.t("add")}
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
            max={99}
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
});
