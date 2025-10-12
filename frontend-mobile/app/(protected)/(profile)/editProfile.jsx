import { ThemedView } from "@/components/themed/ThemedView";
import {
  Platform,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
import { TextInput, HelperText } from "react-native-paper";
import { useQueryClient } from "@tanstack/react-query";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { DateInput } from "@/components/common/DateInput";
import { DropdownMenu } from "@/components/common/DropdownMenu";
import { useLocalSearchParams } from "expo-router";

export default function EditProfile() {
  const color = useThemeColor();
  const [inputText, setInputText] = useState({});

  //  firstName: "",
  //   lastName: "",
  //   birthDate: "",
  //   gender: "",
  //   bankNumber: "",
  //   email: "josefnovak738@gmail.com",
  //   username: "josefnovak738",

  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient(); //smazat

  const { userData } = useLocalSearchParams();

  // ulozi data z profilu do inputu
  useEffect(() => {
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setInputText({
          firstName: parsed?.data?.name || "",
          lastName: parsed?.data?.surname || "",
          birthDate: parsed?.data?.birthDate || "",
          gender:
            parsed?.data?.gender && parsed.data.gender !== "UNSPECIFIED"
              ? parsed.data.gender
              : "",
          bankNumber: "" || "",
        });
      } catch (error) {
        console.warn("Invalid JSON in parametr userData:", error);
      }
    }
  }, [userData]);

  // console.log(inputText);

  const inputColor = {
    colors: {
   
      outline: color.fullName,
      background: color.background,
      primary: color.tabsText,
      error: color.error,

    },
  };

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
                value={inputText.firstName}
                onChangeText={(text) =>
                  setInputText({
                    ...inputText,
                    firstName: text?.replace(/\s+/g, ""),
                  })
                }
                maxLength={30}
                importantForAutofill="yes"
                autoCorrect={false}
                autoCapitalize="sentences"
                // onBlur={() => validateLastName(inputText.lastName)}
                editable={!isSubmitting}
                autoComplete="given-name"
                textContentType="givenName"
                label={i18n.t("firstName")}
                error={false}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={{
                  fontSize: responsiveSize.moderate(15),
                  height: responsiveSize.vertical(41),
                  
                }}
                cursorColor={color.text}
                theme={inputColor}
              />
              <HelperText type="error" visible={false} theme={inputColor}>
                Error
              </HelperText>
            </ThemedView>

            {/* prijmeni */}
            <ThemedView style={styles.input}>
              <TextInput
                value={inputText.lastName}
                onChangeText={(text) =>
                  setInputText({
                    ...inputText,
                    lastName: text?.replace(/\s+/g, ""),
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
                error={false}
                mode="outlined"
                outlineStyle={{ borderRadius: responsiveSize.moderate(7) }}
                style={{
                  fontSize: responsiveSize.moderate(15),
                  height: responsiveSize.vertical(41),
                }}
                cursorColor={color.text}
                theme={inputColor}
              />
              <HelperText type="error" visible={false} theme={inputColor}>
                Error
              </HelperText>
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
          />

          {/* pohlavi */}
          <DropdownMenu
            value={inputText.gender}
            onChange={(gender) =>
              setInputText({ ...inputText, gender: gender })
            }
            label="Gender"
            isSubmitting={!isSubmitting}
            items={[
              { value: "MALE", label: "Male" },
              { value: "FEMALE", label: "Female" },
              { value: "OTHER", label: "Other" },
            ]}
            placeholder="Select gender"
            inputColor={inputColor}
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
    // paddingBottom: responsiveSize.vertical(20),
  },
  contentWrapper: {
    flex: 1,
    // alignItems: "center",
    gap: responsiveSize.vertical(5),
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
    backgroundColor:"#5633",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
});
