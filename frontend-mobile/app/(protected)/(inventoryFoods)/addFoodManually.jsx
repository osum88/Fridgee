import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Alert,
  View,
  TouchableOpacity,
} from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { CheckableItem } from "@/components/common/CheckableItem";
import i18n from "@/constants/translations";

import { useTheme } from "@/contexts/ThemeContext";
import { responsiveSize, responsiveFont, responsivePadding } from "@/utils/scale";
import {
  getDaysUntil,
  getDateFromDays,
  getAmountTexts,
  getCurrency,
  formatPriceInput,
} from "@/utils/stringUtils";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useCallback, useState, seEffect, useLayoutEffect, useMemo, useEffect } from "react";
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

export default function AddFoodManually() {
  const color = useThemeColor();
  const { userId } = useUser();
  const [categories, setCategories] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [inputText, setInputText] = useState({
    inventoryId: "",
    barcode: "",

    catalogId: "",
    categoryId: "",

    variantId: "",
    variantTitle: "",

    title: "",
    description: "",
    currency: "",
    foodImageUrl: "",
    foodImageCloudId: "",
    amount: "",
    unit: "",
    quantity: "",
    price: "",
    expirationDate: "",
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
  });

  const { data: userData } = useGetUserQuery(userId, true);

  useEffect(() => {
    if (currency && !inputText.currency) {
      setInputText((prev) => ({ ...prev, currency: currency }));
    }
  }, [currency, inputText.currency]);

  //defaultni mena uzivatele
  const currency = useMemo(() => {
    if (!userData?.data?.country) return "CZK";
    return getCurrency(userData.data.country);
  }, [userData?.data?.country]);

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(color), [color]);

  // validuje cenu, musi byt cislo s max 2 desetinnymi misty, mezi 0 a 999999
  const validatePrice = (price) => {
    if (!price) return undefined;

    if (price.endsWith(".") || price.endsWith(",")) {
      return null;
    }

    const priceRegex = /^\d+([.,]\d{1,2})?$/;
    if (!priceRegex.test(price)) {
      setErrors((prev) => ({
        ...prev,
        price: i18n.t("priceDecimals"),
      }));
      return;
    }

    const numericPrice = parseFloat(price.replace(",", "."));
    if (numericPrice < 0 || numericPrice > 999999) {
      setErrors((prev) => ({
        ...prev,
        price: i18n.t("priceInvalid"),
      }));
      return;
    }
    return price;
  };

  // console.log("categorieswwww", categories);
  // console.log("selectedCatalog", selectedCatalog?.title);
  // console.log(inputText);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.contentWrapper]}>
          {/* nazev potraviny */}
          <FoodSearchableDropdown
            setInputText={(text) => setInputText((prev) => ({ ...prev, title: text }))}
            setCategories={setCategories}
            selectedCatalog={selectedCatalog}
            setSelectedCatalog={setSelectedCatalog}
            error={errors.title}
            setError={(value) => setErrors((prev) => ({ ...prev, title: value }))}
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
              <TextInput
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
                error={!!errors.expirationDate}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={styles.input}
                theme={inputColor}
              />
            }
          />

          {/* mnozstvi */}
          <DoubleInputRow
            ratio={[1, 1]}
            error={errors.amount}
            inputColor={inputColor}
            leftComponent={
              <TextInput
                value={inputText?.amount || ""}
                onChangeText={(amount) => {
                  const numericAmount = amount.replace(/[^0-9,]/g, "");

                  if (numericAmount !== "") {
                    const num = parseInt(numericAmount, 10);
                    if (!isNaN(num) && (num < 0 || num > 9999)) {
                      setErrors((prev) => ({
                        ...prev,
                        amount: getAmountTexts(inputText.unit)?.error,
                      }));
                      return;
                    }
                  }
                  setErrors((prev) => ({ ...prev, amount: "" }));
                  setInputText((prev) => ({ ...prev, amount: numericAmount }));
                }}
                keyboardType="numeric"
                label={getAmountTexts(inputText.unit)?.label}
                placeholder={getAmountTexts(inputText.unit)?.placeholder}
                error={!!errors.amount}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={styles.input}
                theme={inputColor}
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
              <TextInput
                value={inputText?.price || ""}
                onChangeText={(price) => {
                  const formattedPrice = formatPriceInput(price);
                  if (formattedPrice === undefined) return;
                  setInputText((prev) => ({ ...prev, price: formattedPrice }));
                  if (validatePrice(price)) {
                    setErrors((prev) => ({ ...prev, price: "" }));
                  }
                }}
                keyboardType="numeric"
                label={i18n.t("price")}
                placeholder={i18n.t("enterPrice")}
                error={!!errors.price}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={styles.input}
                theme={inputColor}
              />
            }
            //  měna
            rightComponent={
              <DropdownMenu
                value={inputText.currency || ""}
                onChange={(currency) => setInputText({ ...inputText, currency: currency })}
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
    paddingHorizontal: responsiveSize.horizontal(22),
    paddingTop: responsiveSize.vertical(14),
    width: "100%",
  },

  input: {
    fontSize: responsiveSize.moderate(15),
    height: responsiveSize.vertical(41),
  },
});
