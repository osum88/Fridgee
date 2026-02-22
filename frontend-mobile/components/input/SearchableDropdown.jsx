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
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { TextInput, HelperText, Portal } from "react-native-paper";
import { ThemedView } from "@/components/themed/ThemedView";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export function SearchableDropdown({
  value,
  onChange,
  searchTerm,
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
  scrollViewRef,
  paddingRightIcon = responsiveSize.horizontal(14),
  setScrollSpace,
  error: externalError,
  setError: externalSetError,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownY, setDropdownY] = useState(0);
  const [dropdownX, setDropdownX] = useState(0);
  const [dropdownWidth, setDropdownWidth] = useState(0);
  const [openManually, setOpenManually] = useState(false);

  const containerRef = useRef(null);
  const prevValueRef = useRef(value);
  const isChanging = useRef(false);
  const inputRef = useRef(null);

  const color = useThemeColor();
  const [internalError, internalSetError] = useState("");

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;

  useEffect(() => {
    if (onChangeSearchTerm) {
      onChangeSearchTerm(searchTerm);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // synchronizace textu v inputu s vybranou hodnotou (value)
  useEffect(() => {
    if (prevValueRef.current !== value) {
      if (value !== null) {
        const selectedItem = items.find((item) => item.value === value);
        if (selectedItem) {
          onChangeSearchTerm(selectedItem.label);
        }
      } else if (!isChanging.current) {
        onChangeSearchTerm("");
      }
      prevValueRef.current = value;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const keyboardHideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      const matched = items.find(
        (item) => item.label.trim().toLowerCase() === searchTerm.trim().toLowerCase(),
      );

      if (matched) {
        onChangeSearchTerm(matched.label);
        onChange(matched.value);
      }
    });

    return () => keyboardHideSubscription.remove();
  }, [searchTerm, items, onChange, onChangeSearchTerm]);

  // filtrovani polozek na zaklade vstupu
  const filteredItems = useMemo(() => {
    if (openManually || disableFiltering || !searchTerm) {
      return items;
    }
    return items.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm, disableFiltering, openManually]);

  //otevre dropdown menu a nastavi jeho pozici
  const handleOpen = (isManually = false) => {
    if (!containerRef.current || isChanging.current) return;
    isChanging.current = true;

    // scrolluje
    if (scrollViewRef?.current && !isManually) {
      if (setScrollSpace && items?.length > 0) setScrollSpace(true);

      containerRef.current.measureInWindow((x, y, w, h) => {
        const scrollTarget = y - 100;

        if (scrollTarget > 0) {
          scrollViewRef.current.scrollTo({
            y: scrollTarget,
            animated: true,
          });
        }

        // mereni pocka na dokonceni scrollu
        setTimeout(() => {
          containerRef.current.measure((fx, fy, width, height, px, py) => {
            setDropdownY(py + height);
            setDropdownX(px);
            setDropdownWidth(width);
            setIsOpen(true);
            isChanging.current = false;
          });
        }, 600);
      });
    } else {
      // manualni otevreni
      containerRef.current.measure((fx, fy, width, height, px, py) => {
        setDropdownY(py + height);
        setDropdownX(px);
        setDropdownWidth(width);
        setIsOpen(true);
        setTimeout(() => {
          isChanging.current = false;
        }, 100);
      });
    }
  };

  //zpracuje zmenu textu v inputu pokud text odpovida moznosti z dropdown menu, nastavi tu moznost jako vybranou, jinak odznaci vyber
  const handleSelectWrite = (text) => {
    isChanging.current = true;
    onChangeSearchTerm(text);
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
    onChangeSearchTerm(item.label);
    setError("");
    setIsOpen(false);

    setTimeout(() => {
      isChanging.current = false;
    }, 300);
  };

  const handleClose = () => {
    setIsOpen(false);
    setOpenManually(false);
    if (setScrollSpace) setScrollSpace(false);
    isChanging.current = false;
  };

  inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(color), [color]);

  const isNoResultShow = !showNoResult && filteredItems.length === 0;

  return (
    <ThemedView>
      <View ref={containerRef} collapsable={false}>
        <TextInput
          ref={inputRef}
          value={searchTerm}
          onChangeText={(text) => {
            handleSelectWrite(text);
            if (!isOpen) handleOpen();
          }}
          autoCapitalize="sentences"
          placeholder={placeholder}
          label={label}
          error={!!error}
          mode="outlined"
          cursorColor={color.text}
          editable={!isSubmitting}
          onFocus={() => {
            if (!isOpen) handleOpen();
          }}
          onBlur={() => {
            setTimeout(() => {
              if (!isChanging.current) {
                handleClose();
              }
            }, 100);
          }}
          theme={{
            ...inputColor,
            colors: {
              ...inputColor.colors,
              onSurfaceVariant: error
                ? color.error
                : isOpen
                  ? inputColor.colors.primary
                  : inputColor.colors.onSurfaceVariant,
            },
          }}
          outlineColor={
            error
              ? color.error
              : isOpen
                ? inputColor?.colors?.primary || color.tabsText
                : inputColor?.colors?.outline || color.fullName
          }
          placeholderTextColor={color.inputTextPaper}
          outlineStyle={{
            borderRadius: responsiveSize.moderate(7),
            borderWidth: error || isOpen ? 2 : 1,
          }}
          style={[styles.input, inputStyles]}
          {...props}
        />
        {showDropdownIcon && (
          <TouchableOpacity
            onPress={
              isOpen
                ? () => {
                    handleClose();
                    Keyboard.dismiss();
                    inputRef.current?.blur();
                  }
                : () => {
                    setOpenManually(true);
                    handleOpen(true);
                  }
            }
            style={[styles.iconWrapper, { right: paddingRightIcon }]}
          >
            <IconSymbol
              name={isOpen ? "chevron.up" : "chevron.down"}
              size={responsiveSize.moderate(21)}
              color={error ? color.error : isOpen ? color.tabsText : color.inputIcon}
            />
          </TouchableOpacity>
        )}
      </View>

      {isOpen && (
        <Portal>
          <TouchableWithoutFeedback
            onPress={() => {
              handleClose();
              Keyboard.dismiss();
              inputRef.current?.blur();
            }}
          >
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>

          {!isNoResultShow && (
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
          )}
        </Portal>
      )}

      <HelperText type="error" visible={!!error} style={styles.helper} theme={inputColor}>
        {error}
      </HelperText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    fontSize: responsiveFont(15),
    backgroundColor: "transparent",
  },
  iconWrapper: {
    position: "absolute",
    paddingVertical: responsiveSize.vertical(18),
    paddingHorizontal: responsiveSize.horizontal(15),
    zIndex: 10,
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
