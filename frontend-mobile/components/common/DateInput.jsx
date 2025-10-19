import { ThemedView } from "@/components/themed/ThemedView";
import { Platform } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { TextInput, HelperText } from "react-native-paper";
import {
  formatDate,
  formatDateInput,
  parseDateMidnight,
} from "@/utils/stringUtils";
import DateTimePicker from "@react-native-community/datetimepicker";

export function DateInput({
  value,
  onChange,
  label,
  isSubmitting,
  autoComplete,
  error: externalError,
  setError: externalSetError,
  inputColor,
  inputStyles,
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
    if (!dateText && !prevDate) {
      setDateText(value ? formatDate(value) : "");
      setPrevDate(value ? formatDate(value) : "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!inputColor) {
    inputColor = {
      colors: {
        outline: color.fullName,
        background: color.background,
        primary: color.tabsText,
        error: color.error,
        onSurface: color.text,
        onSurfaceVariant: color.inputTextPaper,
      },
    };
  }

  //zpracuje datum zadany rucne a a opravuje smazani tecek ktere se automaticky doplnuji
  const handleDateInput = (text) => {
    setError("");
    if (text) {
      const [day, month, year] = text.split(".").map(Number);

      // validace dne
      if (day && Number(day) > 31) {
        setError(i18n.t("errorDay"));
      }

      // validace mesice
      if (month && Number(month) > 12) {
        setError(i18n.t("errorMonth"));
      }

      // validace roku
      const currentYear = new Date().getFullYear();
      if (year && Number(year) > currentYear) {
        setError(`${i18n.t("errorYear")} ${currentYear}`);
      }
      const year1920 = new Date(1920, 0, 1).getFullYear();
      if (Number(year) < year1920) {
        setError(`${i18n.t("errorYearLow")} ${year1920}`);
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
    setShowPicker(false);
    setIsEditable(!isEditable);
    if (selectedDate) {
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
        theme={inputColor}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        right={
          <TextInput.Icon
            color={
              error ? color.error : isFocused ? color.tabsText : color.inputIcon
            }
            icon="calendar"
            onPress={() => {
              setShowPicker(true);
              setIsEditable(!isEditable);
            }}
          />
        }
        {...props}
      />
      <HelperText
        type="error"
        visible={error}
        style={{ marginLeft: responsiveSize.horizontal(-9) }}
        theme={inputColor}
      >
        {error}
      </HelperText>

      {showPicker && (
        <DateTimePicker
          value={
            value instanceof Date ? value : value ? new Date(value) : new Date()
          }
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateCalendar}
        />
      )}
    </ThemedView>
  );
}
