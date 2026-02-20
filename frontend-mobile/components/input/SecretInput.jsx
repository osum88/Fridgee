import { ThemedView } from "@/components/themed/ThemedView";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { TextInput, HelperText } from "react-native-paper";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { SecureAccessModal } from "@/components/modals/SecureAccessModal";
import { isCzOrSkAccountFormat, isValidIBANFormat } from "@/utils/stringUtils";

export function SecretInput({
  value,
  onChangeText,
  label,
  placeholder,
  maxLength = 40,
  isSubmitting,
  type = "iban",
  isSecretExisting,
  error: externalError,
  setError: externalSetError,
  onShowText,
  inputColor,
  inputStyles,
  ...props
}) {
  const [showBankNumber, setShowBankNumber] = useState(false);
  const [showModal, setModal] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isShowTextSet, setIsShowTextSet] = useState(false);
  const [internalError, internalSetError] = useState("");

  const error = externalError !== undefined ? externalError : internalError;
  const setError = externalSetError || internalSetError;
  const color = useThemeColor();

  useEffect(() => {
    setShowBankNumber(!isSecretExisting);
  }, [isSecretExisting]);

  useEffect(() => {
    if (showBankNumber && onShowText && !isShowTextSet) {
      onShowText(value);
      setIsShowTextSet(true);
    }
  }, [onShowText, showBankNumber, isShowTextSet, value]);

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

  //validace bankovniho cisla
  const validateBankNumber = (text) => {
    setIsFocused(false);
    let isValid = true;

    if (type === "iban") {
      isValid = isValidIBANFormat(text);
      if (!isValid) {
        setError(i18n.t("invalidIbanFormat"));
      }
    } else if (type === "czOrSk") {
      isValid = isCzOrSkAccountFormat(text);
      if (!isValid) {
        setError(i18n.t("invalidBankAccountFormat"));
      }
    }

    if (isValid || !text) {
      setError("");
    }
  };

  return (
    <>
      <ThemedView style={inputStyles}>
        <TextInput
          value={showBankNumber ? value : "*************"}
          onChangeText={(text) => {
            onChangeText(text);
            if (!text) {
              setError("");
            }
          }}
          maxLength={maxLength}
          importantForAutofill="yes"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder={placeholder}
          editable={isSubmitting && showBankNumber}
          textContentType="none"
          label={label}
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
          onBlur={() => validateBankNumber(value)}
          right={<TextInput.Icon />}
          {...props}
        />
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => {
            setModal(!showModal && !showBankNumber);
            setShowBankNumber(false);
          }}
        >
          <IconSymbol
            size={responsiveSize.moderate(24)}
            name={showBankNumber || showModal ? "eye" : "eye.slash"}
            color={
              error ? color.error : isFocused ? color.tabsText : color.inputIcon
            }
          />
        </TouchableOpacity>
        <HelperText
          type="error"
          visible={error}
          style={{ marginLeft: responsiveSize.horizontal(-9) }}
          theme={inputColor}
        >
          {error}
        </HelperText>
      </ThemedView>
      <SecureAccessModal
        visible={showModal}
        setVisible={setModal}
        type={type}
        onPress={() => setShowBankNumber(true)}
        onChangeText={onChangeText}
      />
    </>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    position: "absolute",
    top: responsiveSize.vertical(11),
    right: responsiveSize.horizontal(8),
    paddingVertical: responsiveSize.vertical(5),
    paddingHorizontal: responsiveSize.horizontal(5),
  },
});
