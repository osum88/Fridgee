import { ThemedView } from "@/components/themed/ThemedView";
import { Platform } from "react-native";
import { memo, useEffect, useMemo, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { TextInput, HelperText } from "react-native-paper";
import { formatDate, formatDateInput, parseDateMidnight } from "@/utils/stringUtils";
import DateTimePicker from "@react-native-community/datetimepicker";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";

function DateInputComponent({
  value,
  onChange,
  label,
  isSubmitting = true,
  autoComplete,
  maxYearsInFuture,
  minYearsInPast,
  error: externalError,
  setError: externalSetError,
  inputColor: externalInputColor,
  inputStyles,
  showError = true,
  ...props
}) {
  const [dateText, setDateText] = useState("");
  const [prevDate, setPrevDate] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [internalError, internalSetError] = useState("");

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;

  const color = useThemeColor();

  useEffect(() => {
    if (isFocused) return;
    if (!value) {
      setDateText("");
      setPrevDate("");
      return;
    }

    const dateObj = value instanceof Date ? value : new Date(value);

    if (!isNaN(dateObj.getTime())) {
      const formattedValue = formatDate(dateObj);
      if (formattedValue !== dateText) {
        setDateText(formattedValue);
        setPrevDate(formattedValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const finalInputColor = useMemo(
    () => externalInputColor || GET_INPUT_THEME_NATIVE_PAPER(color),
    [externalInputColor, color],
  );

  const getYearError = (year) => {
    const currentYear = new Date().getFullYear();
    const maxAllowedYear = maxYearsInFuture ? currentYear + maxYearsInFuture : currentYear;
    const minAllowedYear = minYearsInPast ? currentYear - minYearsInPast : currentYear - 105;

    if (year > maxAllowedYear) {
      return `${i18n.t("errorYear")} ${maxAllowedYear}`;
    }
    if (year < minAllowedYear) {
      return `${i18n.t("errorYearLow")} ${minAllowedYear}`;
    }
    return null;
  };

  //zpracuje datum zadany rucne a a opravuje smazani tecek ktere se automaticky doplnuji
  const handleDateInput = (text) => {
    setError("");
    if (text) {
      const parts = text.split(".");
      const dayStr = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];

      const day = Number(dayStr);
      const month = Number(monthStr);
      const year = Number(yearStr);

      // validace dne
      if (dayStr !== "" && (day > 31 || day < 1)) {
        setError(i18n.t("errorDay"));
      }

      // validace mesice
      if (monthStr !== undefined && monthStr !== "" && (month > 12 || month < 1)) {
        setError(i18n.t("errorMonth"));
      }

      // validace roku
      if (yearStr && yearStr.length === 4) {
        const yearError = getYearError(year);
        if (yearError) setError(yearError);
      }
    }

    //overi jestli se input maze nebo pise
    const isDeleting = text.length < prevDate.length;
    let formatted = text;

    if (!isDeleting) {
      formatted = formatDateInput(text);
    }

    setDateText(formatted);
    setPrevDate(formatted);

    const date = parseDateMidnight(formatted);
    if (date || !text) {
      onChange(date || "");
    }
  };

  //zpracuje datum z kalendare
  const handleDateCalendar = (event, selectedDate) => {
    if (event.type === "dismissed") {
      setShowPicker(false);
      setIsEditable(!isEditable);
      return;
    }

    setShowPicker(false);
    setIsEditable(!isEditable);

    if (selectedDate) {
      const yearError = getYearError(selectedDate.getFullYear());

      if (yearError) {
        setError(yearError);
      } else {
        setError("");
      }
      onChange(selectedDate);
      setDateText(formatDate(selectedDate));
    }
  };

  return (
    <ThemedView style={inputStyles}>
      <TextInput
        value={dateText}
        onChangeText={handleDateInput}
        maxLength={10}
        editable={isSubmitting && isEditable}
        autoComplete={autoComplete}
        label={label}
        keyboardType="numeric"
        placeholder="DD.MM.YYYY"
        error={error}
        mode="outlined"
        outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
        style={{
          fontSize: responsiveSize.moderate(15),
          height: responsiveSize.vertical(41),
        }}
        cursorColor={color.text}
        theme={finalInputColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        right={
          <TextInput.Icon
            color={error ? color.error : isFocused ? color.tabsText : color.inputIcon}
            icon="calendar"
            onPress={() => {
              setShowPicker(true);
              setIsEditable(!isEditable);
            }}
          />
        }
        {...props}
      />
      {showError && (
        <HelperText
          type="error"
          visible={error}
          style={{
            marginLeft: responsiveSize.horizontal(-9),
            marginTop: responsiveSize.vertical(-2),
          }}
          theme={finalInputColor}
        >
          {error}
        </HelperText>
      )}

      {showPicker && (
        <DateTimePicker
          value={value instanceof Date ? value : value ? new Date(value) : new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateCalendar}
        />
      )}
    </ThemedView>
  );
}


export const DateInput = memo(DateInputComponent);
