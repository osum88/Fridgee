import { ThemedView } from "@/components/themed/ThemedView";
import {
  Platform,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { TextInput, HelperText, ActivityIndicator } from "react-native-paper";
import { DateInput } from "@/components/common/DateInput";
import { DropdownMenu } from "@/components/common/DropdownMenu";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { SecretInput } from "@/components/common/SecretInput";
import { ibanToBban, validateDate } from "@/utils/stringUtils";
import { ThemedText } from "@/components/themed/ThemedText";
import useUpdateProfile from "@/hooks/user/useUpdateProfile";

export default function EditProfile() {
  const color = useThemeColor();
  const [inputText, setInputText] = useState({});
  const [originalData, setOriginalData] = useState({});
  const [existBankNumber, setExistBankNumber] = useState(true);
  const [errors, setErrors] = useState({
    name: "",
    surname: "",
    birthDate: "",
    gender: "",
    country: "",
    bankNumber: "",
  });
  const navigation = useNavigation();

  const { userData } = useLocalSearchParams();

  const { updateProfile, isSubmitting } = useUpdateProfile();

  // ulozi data z profilu do inputu
  useEffect(() => {
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setOriginalData(parsed?.data || {});
        const hasBankNumber = parsed?.data?.bankNumber ? true : false;
        setExistBankNumber(hasBankNumber);

        setInputText({
          name: parsed?.data?.name || "",
          surname: parsed?.data?.surname || "",
          birthDate: parsed?.data?.birthDate || "",
          gender:
            parsed?.data?.gender && parsed.data.gender !== "UNSPECIFIED"
              ? parsed.data.gender
              : "",
          bankNumber: hasBankNumber ? "" : parsed?.data?.bankNumber || "",
          country: parsed?.data?.country || "",
        });
      } catch (error) {
        console.warn("Invalid JSON in parametr userData:", error);
      }
    }
  }, [userData]);

  // zjisti jestli doslo ke zmenam v udajich
  const hasChanges = useMemo(() => {
    for (const key in inputText) {
      if (inputText[key] !== originalData[key]) {
        if (
          (key === "bankNumber" &&
            !inputText[key] &&
            originalData[key] &&
            typeof originalData[key] !== "string") ||
          (!inputText[key] && !originalData[key]) ||
          (key === "gender" &&
            !inputText[key] &&
            originalData[key] === "UNSPECIFIED")
        ) {
          continue;
        }
        return true;
      }
    }
    return false;
  }, [inputText, originalData]);

  // zabrani uzavreni obrazovky pri neulozenych zmenach
  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (event) => {
      if (!hasChanges) return;

      event.preventDefault();

      if (isSubmitting) return;
      Alert.alert(i18n.t("unsavedChanges"), i18n.t("unsavedChangesMessage"), [
        {
          text: i18n.t("discardChange"),
          style: "destructive",
          onPress: () => navigation.dispatch(event.data.action),
        },
        { text: i18n.t("cancel"), style: "cancel", onPress: () => {} },
      ]);
    });

    return unsubscribe;
  }, [navigation, isSubmitting, hasChanges]);

  //nastavi tlacitko ulozit v headeru
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            if (hasChanges && !isSubmitting) {
              if (inputText.birthDate && !validateDate(inputText.birthDate)) {
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
              let originalBeforeDeleted = originalData.bankNumber;
              if (
                !inputText.bankNumber &&
                originalData.bankNumber &&
                typeof originalData.bankNumber !== "string"
              ) {
                delete inputText.bankNumber;
                bankNumberWasDeleted = true;
              }
              updateProfile.mutate(inputText, {
                onSuccess: () => {
                  if (bankNumberWasDeleted) {
                    setOriginalData({
                      ...inputText,
                      bankNumber: originalBeforeDeleted,
                    });
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

                  // navigation.goBack();
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
              {i18n.t("save")}
            </ThemedText>
          )}
        </TouchableOpacity>
      ),
    });
  }, [
    navigation,
    hasChanges,
    isSubmitting,
    color,
    inputText,
    updateProfile,
    originalData.bankNumber,
  ]);

  const inputColor = {
    colors: {
      outline: color.fullName,
      background: color.background,
      primary: color.tabsText,
      error: color.error,
      text: color.error,
      onSurface: color.text,
      onSurfaceVariant: color.inputTextPaper,
    },
  };

  // formatuje text pro bankovni cislo
  const formatText = useCallback((text) => {
    let rawText = text;

    if (
      typeof text === "object" &&
      text !== null &&
      text.bankNumber !== undefined
    ) {
      rawText = text.bankNumber;
    }
    return String(rawText || "").replace(/\s+/g, "");
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={[styles.contentWrapper]}>
          <ThemedView style={styles.doubleInput}>
            {/* jmeno */}
            <ThemedView style={styles.input}>
              <TextInput
                value={inputText.name}
                onChangeText={(text) =>
                  setInputText({
                    ...inputText,
                    name: text?.replace(/\s+/g, ""),
                  })
                }
                maxLength={40}
                importantForAutofill="yes"
                autoCorrect={false}
                autoCapitalize="sentences"
                editable={!isSubmitting}
                autoComplete="given-name"
                textContentType="givenName"
                label={i18n.t("firstName")}
                error={!!errors.name}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={{
                  fontSize: responsiveSize.moderate(15),
                  height: responsiveSize.vertical(41),
                  color: color.text,
                }}
                cursorColor={color.text}
                theme={inputColor}
              />
              <HelperText
                type="error"
                visible={!!errors.name}
                style={{ marginLeft: responsiveSize.horizontal(-9) }}
                theme={inputColor}
              >
                {errors.name}
              </HelperText>
            </ThemedView>

            {/* prijmeni */}
            <ThemedView style={styles.input}>
              <TextInput
                value={inputText.surname}
                onChangeText={(text) =>
                  setInputText({
                    ...inputText,
                    surname: text?.replace(/\s+/g, ""),
                  })
                }
                maxLength={30}
                importantForAutofill="yes"
                autoCorrect={false}
                autoCapitalize="sentences"
                editable={!isSubmitting}
                autoComplete="family-name"
                textContentType="familyName"
                label={i18n.t("lastName")}
                error={errors.surname}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={{
                  fontSize: responsiveSize.moderate(15),
                  height: responsiveSize.vertical(41),
                }}
                cursorColor={color.text}
                theme={inputColor}
              />
            </ThemedView>
          </ThemedView>

          {/* datum narozeni */}
          <DateInput
            value={inputText.birthDate}
            label={i18n.t("birthdate")}
            onChange={(date) => setInputText({ ...inputText, birthDate: date })}
            isSubmitting={!isSubmitting}
            autoComplete="birthdate-full"
            inputColor={inputColor}
            error={errors.birthDate}
            setError={(value) =>
              setErrors((prev) => ({ ...prev, birthDate: value }))
            }
          />

          {/* pohlavi */}
          <DropdownMenu
            value={inputText.gender}
            onChange={(gender) =>
              setInputText({ ...inputText, gender: gender })
            }
            label={i18n.t("gender")}
            isSubmitting={!isSubmitting}
            items={[
              { value: "MALE", label: i18n.t("male") },
              { value: "FEMALE", label: i18n.t("female") },
              { value: "OTHER", label: i18n.t("otherS") },
            ]}
            placeholder={i18n.t("selectGender")}
            inputColor={inputColor}
            error={errors.gender}
            setError={(value) =>
              setErrors((prev) => ({ ...prev, gender: value }))
            }
          />

          {/* zeme */}
          <DropdownMenu
            value={inputText.country}
            onChange={(country) =>
              setInputText({ ...inputText, country: country })
            }
            label={i18n.t("bankAccountCountry")}
            isSubmitting={!isSubmitting}
            items={[
              { value: "CZ", label: i18n.t("czech") },
              { value: "SK", label: i18n.t("slovakia") },
              { value: "OTHER", label: i18n.t("otherZ") },
            ]}
            placeholder={i18n.t("selectCountry")}
            inputColor={inputColor}
            error={errors.country}
            setError={(value) =>
              setErrors((prev) => ({ ...prev, country: value }))
            }
          />

          {/* bankovani cislo nebo IBAN v zavislosti na zemi */}
          {inputText?.country === "CZ" || inputText?.country === "SK" ? (
            <SecretInput
              value={ibanToBban(inputText.bankNumber)}
              onChangeText={(text) => {
                setInputText({
                  ...inputText,
                  bankNumber: formatText(text),
                });
              }}
              maxLength={22}
              placeholder="19-1234567890/0800"
              isSubmitting={!isSubmitting}
              type="czOrSk"
              label={i18n.t("bankNumber")}
              isSecretExisting={existBankNumber}
              onShowText={(text) => {
                {
                  setOriginalData({
                    ...originalData,
                    bankNumber: formatText(text),
                  });
                }
              }}
              error={errors.bankNumber}
              setError={(value) =>
                setErrors((prev) => ({ ...prev, bankNumber: value }))
              }
            />
          ) : (
            <SecretInput
              value={inputText.bankNumber}
              onChangeText={(text) => {
                setInputText({
                  ...inputText,
                  bankNumber: formatText(text),
                });
              }}
              maxLength={34}
              placeholder="CZ6508000000192000145399"
              isSubmitting={!isSubmitting}
              type="iban"
              label="IBAN"
              isSecretExisting={existBankNumber}
              onShowText={(text) => {
                {
                  setOriginalData({
                    ...originalData,
                    bankNumber: formatText(text),
                  });
                }
              }}
              error={errors.bankNumber}
              setError={(value) =>
                setErrors((prev) => ({ ...prev, bankNumber: value }))
              }
            />
          )}
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
  doubleInput: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: responsiveSize.horizontal(12),
  },
  input: {
    flexBasis: "48%",
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  overlay: {
    backgroundColor: "#5633",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
