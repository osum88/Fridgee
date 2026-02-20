import { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  Keyboard,
  ScrollView,
} from "react-native";
import i18n from "@/constants/translations";

import { TextInput, HelperText, Portal } from "react-native-paper";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export function SearchableDropdown({
  value,
  onChange,
  onChangeSearchTerm,
  label,
  items = [],
  placeholder,
  isSubmitting,
  inputColor,
  inputStyles,
  disableAutoSelect = false,
  disableFiltering = false,
  showNoResult = true,
  showDropdownIcon = true,
  maxHeight = 240,
  error: externalError,
  setError: externalSetError,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [dropdownY, setDropdownY] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);

  const containerRef = useRef(null);
  const prevValueRef = useRef(value);
  const isChanging = useRef(false);

  const color = useThemeColor();
  const [internalError, internalSetError] = useState("");

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;

  useEffect(() => {
    if (onChangeSearchTerm) {
      onChangeSearchTerm(inputText);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText]);

  // synchronizace textu v inputu s vybranou hodnotou (value)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      if (value !== null) {
        const selectedItem = items.find((item) => item.value === value);
        if (selectedItem) {
          setInputText(selectedItem.label);
        }
      } else if (!isChanging.current) {
        setInputText("");
      }
      prevValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const keyboardHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsOpen(false);

      const matched = items.find(
        (item) => item.label.trim().toLowerCase() === inputText.trim().toLowerCase(),
      );

      if (matched) {
        setInputText(matched.label);
        onChange(matched.value);
      }
    });

    return () => keyboardHideSubscription.remove();
  }, [inputText, items, onChange]);

  // filtrovani polozek na zaklade vstupu
  const filteredItems = useMemo(() => {
    if (disableFiltering || !inputText || items.find((i) => i.label === inputText)) {
      return items;
    }
    return items.filter((item) => item.label.toLowerCase().includes(inputText.toLowerCase()));
  }, [items, inputText, disableFiltering]);

  //otevre dropdown menu a nastavi jeho pozici
  const handleOpen = () => {
    if (containerRef.current) {
      containerRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownY(py + height);
        setDropdownX(px);
        setDropdownWidth(width);
        setIsOpen(true);
      });
    }
  };

  //zpracuje zmenu textu v inputu pokud text odpovida moznosti z dropdown menu, nastavi tu moznost jako vybranou, jinak odznaci vyber
  const handleSelectWrite = (text) => {
    isChanging.current = true;
    setInputText(text);
    setError("");

    const normalizedInput = text.trim().toLowerCase();
    const selectedItem = items.find((item) => item.label.trim().toLowerCase() === normalizedInput);

    if (selectedItem) {
      if (value !== selectedItem.value) {
        prevValueRef.current = selectedItem.value;
        if (!disableAutoSelect) {
          onChange(selectedItem.value);
        }
      }
    } else if (value !== null) {
      prevValueRef.current = null;
      onChange(null);
    }

    setTimeout(() => {
      isChanging.current = false;
    }, 50);
  };

  // vyber polozky z dropdown menu, nastavi ji jako vybranou a zavre dropdown
  const handleSelect = (item) => {
    if (isChanging.current) return;
    isChanging.current = true;

    prevValueRef.current = item.value;
    onChange(item.value);
    setInputText(item.label);
    setError("");
    setIsOpen(false);

    setTimeout(() => {
      isChanging.current = false;
    }, 300);
  };

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

  const isNoResultShow = !showNoResult && filteredItems.length === 0;

  return (
    <ThemedView>
      <View ref={containerRef} collapsable={false}>
        <TextInput
          value={inputText}
          onChangeText={(text) => {
            handleSelectWrite(text);
            if (!isOpen) handleOpen();
          }}
          onFocus={handleOpen}
          placeholder={placeholder}
          label={label}
          error={!!error}
          mode="outlined"
          outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
          style={[styles.input, inputStyles]}
          cursorColor={color.text}
          theme={inputColor}
          editable={!isSubmitting}
          right={
            showDropdownIcon && (
              <TextInput.Icon
                icon={isOpen ? "chevron-up" : "chevron-down"}
                onPress={isOpen ? () => setIsOpen(false) : handleOpen}
              />
            )
          }
          {...props}
        />
      </View>

      {isOpen && !isNoResultShow && (
        <Portal>
          <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          <View
            style={[
              styles.containerStyle,
              {
                top: dropdownY,
                left: dropdownX,
                width: dropdownWidth,
                backgroundColor: color.whiteAndSurface,
                maxHeight: responsiveSize.vertical(maxHeight),
              },
            ]}
          >
            <ScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              persistentScrollbar={true}
            >
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <TouchableOpacity
                    key={item.value}
                    style={styles.item}
                    onPress={() => handleSelect(item)}
                  >
                    <Text style={[styles.itemText, { color: color.text }]}>{item.label}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.item}>
                  <Text style={{ color: color.text }}>{i18n.t("noResults")}</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </Portal>
      )}

      <HelperText type="error" visible={!!error} style={styles.helper} theme={inputColor}>
        {error}
      </HelperText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: responsiveFont(15),
    backgroundColor: "transparent",
  },
  containerStyle: {
    position: "absolute",
    borderRadius: responsiveSize.moderate(7),
    paddingVertical: responsiveSize.vertical(6),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  item: {
    paddingVertical: responsiveSize.vertical(10),
    paddingHorizontal: responsiveSize.horizontal(16),
  },
  itemText: {
    fontSize: responsiveFont(14),
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  helper: {
    marginLeft: responsiveSize.horizontal(-9),
    marginTop: responsiveSize.vertical(-2),
  },
});
