import { ThemedView } from "@/components/themed/ThemedView";
import { Platform } from "react-native";
import { useState } from "react";
import { useThemeColor } from "@/hooks/useThemeColor";
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
  inputColor,
  inputStyles,
  ...props
}) {
  const [dateText, setDateText] = useState(value ? formatDate(value) : "");
  const [prevDate, setPrevDate] = useState(dateText);
  const [showPicker, setShowPicker] = useState(false);
  const [isEditable, setIsEditable] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [error, setError] = useState(false);
  const [textError, setTextError] = useState("");
  const color = useThemeColor();

  if (!inputColor) {
    inputColor = {
      colors: {
        outline: color.fullName,
        background: color.background,
        primary: color.tabsText,
        error: color.error,
      },
    };
  }

  //zpracuje datum zadany rucne a a opravuje smazani tecek ktere se automaticky doplnuji
  const handleDateInput = (text) => {
    setError(false);
    if (text) {
      const [day, month, year] = text.split(".").map(Number);

      // validace dne
      if (day && Number(day) > 31) {
        setTextError(i18n.t("errorDay"));
        setError(true);
      }

      // validace mesice
      if (month && Number(month) > 12) {
        setTextError(i18n.t("errorMonth"));
        setError(true);
      }

      // validace roku
      const currentYear = new Date().getFullYear();
      if (year && Number(year) > currentYear) {
        setTextError(`${i18n.t("errorYear")} ${currentYear}`);
        setError(true);
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
        {textError}
      </HelperText>

      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handleDateCalendar}
        />
      )}
    </ThemedView>
  );
}
