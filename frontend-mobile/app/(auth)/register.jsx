import {
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import i18n from "@/constants/translations";
import { Link } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedButton } from "@/components/themed/ThemedButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { FormGroup } from "../../components/common/FormGroup";
import { FormGroupPassword } from "@/components/common/FormGroupPassword";
import { useState } from "react";
import useRegisterMutation from "@/hooks/auth/useRegisterMutation";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Register() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const [password, setPassword] = useState(null);
  const [confirmPassword, setconfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [passwordError, setPasswordError] = useState(null);
  const { locale } = useLanguage();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { registerMutation, isLoading } = useRegisterMutation({
    setUsernameError,
    setEmailError,
    setPasswordError,
  });

  const handleSubmit = () => {
    setUsernameError(null);
    setEmailError(null);
    setPasswordError(null);

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!username || !email || !password || !confirmPassword) {
      setUsernameError(" ");
      setEmailError(" ");
      setPasswordError(i18n.t("errorAllFieldsRequired"));
    } else if (password !== confirmPassword) {
      setPasswordError(i18n.t("errorPasswordMismatch"));
    } else if (username.length < 3 || username.length > 30) {
      setUsernameError(i18n.t("errorUsernameTooLong"));
    } else if (!passwordRegex.test(password)) {
      setPasswordError(i18n.t("errorPasswordTooWeak"));
    } else if (!emailRegex.test(email)) {
      setEmailError(i18n.t("errorValidEmail"));
    } else {
      registerMutation.mutate({
        username,
        email,
        password,
        preferredLanguage: locale,
      });
    }
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
            <ThemedText style={styles.register} type="title">
              {i18n.t("registration")}
            </ThemedText>
            <ThemedView style={styles.formSection}>
              <FormGroup
                label={i18n.t("username")}
                placeholder={i18n.t("enterYourUsername")}
                maxLength={30}
                autoCapitalize="none"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                error={usernameError}
              />
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                keyboardType="email-address"
                style={styles.input}
                value={email}
                maxLength={150}
                autoCapitalize="none"
                onChangeText={setEmail}
                error={emailError}
              />
              <FormGroupPassword
                label={i18n.t("password")}
                placeholder={i18n.t("enterYourPassword")}
                style={styles.input}
                maxLength={100}
                autoCapitalize="none"
                importantForAutofill="no"
                value={password}
                onChangeText={setPassword}
                error={passwordError}
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
                onChangeText={setconfirmPassword}
                error={passwordError}
              />
            </ThemedView>

            <ThemedButton
              onPress={handleSubmit}
              style={styles.btn}
              disabled={isLoading}
              loading={isLoading}
            >
              {i18n.t("signUpButton")}
            </ThemedButton>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
      <ThemedView safe={true} style={styles.bottomLinkContainer}>
        <ThemedView style={styles.textRow}>
          <ThemedText>{i18n.t("alreadyHaveAnAccount")}</ThemedText>
          <Link href="/login" replace asChild>
            <ThemedText
              lightColor={currentColors.primary}
              darkColor={currentColors.primary}
            >
              {i18n.t("loginNow")}
            </ThemedText>
          </Link>
        </ThemedView>
      </ThemedView>
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
  textRow: {
    flexDirection: "row",
    gap: 5,
    alignSelf: "center",
  },
  formSection: {
    gap: 4,
  },
  register: {
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  bottomLinkContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
