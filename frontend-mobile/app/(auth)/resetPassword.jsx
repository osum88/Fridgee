import {
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import i18n from "@/constants/translations";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedButton } from "@/components/themed/ThemedButton";
import { FormGroupPassword } from "@/components/common/FormGroupPassword";
import { useState } from "react";
import useResetPasswordMutation from "@/hooks/auth/useResetPasswordMutation";
import { SuccessAnimation } from "@/components/animated/SuccessAnimation";

export default function ResetPassword() {
  const [newPassword, setPassword] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const { token } = useLocalSearchParams();
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState(null);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { resetPasswordMutation, isLoading } = useResetPasswordMutation({
    setError,
    setSuccess,
  });

  const handleSubmit = async () => {
    setError(null);
    setSuccess(true)

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    if (!newPassword || !confirmPassword) {
      setError(i18n.t("errorAllFieldsRequired"));
    } else if (newPassword !== confirmPassword) {
      setError(i18n.t("errorPasswordMismatch"));
    } else if (!passwordRegex.test(newPassword)) {
      setError(i18n.t("errorPasswordTooWeak"));
    } else if (!token) {
      setError(i18n.t("errorTokenMissing"));
    } else {
      resetPasswordMutation.mutate({ token, newPassword });
    }
  };
  
  const handleContinue = async () => {
    router.replace("/login")
  };

  return (
    <ThemedView safe={true} style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <ThemedView
            style={[
              styles.contentWrapper,
              { width: isTablet ? "50%" : "100%" },
            ]}
          >
            {success ? (
              <>
                <SuccessAnimation />
                <ThemedView style={styles.changeSuccesfullyContainer}>
                  <ThemedText style={styles.changeSuccesfully} type="title">
                    {i18n.t("success")}
                  </ThemedText>
                  <ThemedView style={styles.changeSuccesfullyText}>
                    <ThemedText style={[{textAlign: "center"}]}>
                      {i18n.t("passwordChangedSuccessfully")}
                    </ThemedText>
                    <ThemedText style={[{textAlign: "center"}]}>{i18n.t("nowSingIn")}</ThemedText>
                  </ThemedView>
                </ThemedView>
              </>
            ) : (
              <>
                <ThemedText style={styles.register} type="title">
                  {i18n.t("resetPassword")}
                </ThemedText>
                <ThemedView style={styles.formSection}>
                  <FormGroupPassword
                    label={i18n.t("newPassword")}
                    placeholder={i18n.t("enterYourPassword")}
                    style={styles.input}
                    maxLength={100}
                    autoCapitalize="none"
                    importantForAutofill="no"
                    value={newPassword}
                    onChangeText={setPassword}
                    error={error}
                    showError={false}
                  />
                  <FormGroupPassword
                    label={i18n.t("confirmPassword")}
                    placeholder={i18n.t("passwordAgain")}
                    style={styles.input}
                    maxLength={100}
                    autoCapitalize="none"
                    importantForAutofill="no"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    error={error}
                  />
                </ThemedView>

                <ThemedButton
                  onPress={handleSubmit}
                  style={styles.btn}
                  disabled={isLoading}
                  loading={isLoading}
                >
                  {i18n.t("saveNewPassword")}
                </ThemedButton>
              </>
            )}
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
      {success && (
        <ThemedView
          safe={true}
          style={[
            styles.bottomButtonContainer,
            { width: isTablet ? "50%" : "100%" },
          ]}
        >
          <ThemedButton
            onPress={handleContinue}
            style={[styles.btn]}
          >
            {i18n.t("continue")}
          </ThemedButton>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  contentWrapper: {
    alignItems: "center",
    gap: 20,
    paddingHorizontal: 20,
    width: "100%",
  },
  btn: {
    paddingVertical: 16,
    width: "100%",
  },
  input: {
    paddingVertical: 18,
    width: "100%",
  },
  formSection: {
    gap: 4,
    width: "100%",
  },
  register: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  changeSuccesfully: {
    marginBottom: 8,
  },
  changeSuccesfullyContainer: {
    marginTop: 20,
    gap: 8,
    alignItems: "center",
  },
  changeSuccesfullyText: {
    gap: 2,
    alignItems: "center",
    textAlign: "center",
  },
  bottomButtonContainer: {
    alignSelf: 'center',
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
    bottom: 30,
  },
});
