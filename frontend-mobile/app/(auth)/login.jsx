import {
  useWindowDimensions,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import i18n from "@/constants/translations";
import { Link } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedButton } from "@/components/themed/ThemedButton";
import { FormGroup } from "../../components/common/FormGroup";
import { FormGroupPassword } from "../../components/common/FormGroupPassword";
import { useState } from "react";
import { ThemedCheckbox } from "@/components/themed/ThemedCheckbox";
import useLoginMutation from "@/hooks/auth/useLoginMutation";
import { useThemeColor } from "@/hooks/useThemeColor";


export default function Login() {
  const currentColors = useThemeColor();
  const [password, setPassword] = useState("");
  const [rememberMe, setToggleCheckBox] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const { loginMutation, isLoading } = useLoginMutation({
    setError,
    rememberMe,
  });

  const handleSubmit = () => {
    setError(null);

    if (!email || !password) {
      setError(i18n.t("errorEmptyEmailPassword"));
    } else {
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <ThemedView safe={true} style={styles.container}>
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
            <ThemedText style={styles.login} type="title">
              {i18n.t("login")}
            </ThemedText>

            <ThemedView style={styles.formSection}>
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
                value={email}
                autoCapitalize="none"
                onChangeText={setEmail}
                error={error}
                showError={false}
                importantForAutofill="no"
              />

              <ThemedView style={styles.passwordSection}>
                <FormGroupPassword
                  label={i18n.t("password")}
                  placeholder={i18n.t("enterYourPassword")}
                  autoComplete="password"
                  style={styles.input}
                  maxLength={70}
                  autoCapitalize="none"
                  importantForAutofill="yes"
                  value={password}
                  onChangeText={setPassword}
                  error={error}
                  moveAround={true}
                />
                <Link href="/forgotPassword" asChild>
                  <ThemedText
                    style={styles.flexEnd}
                    lightColor={currentColors.primary}
                    darkColor={currentColors.primary}
                  >
                    {i18n.t("forgotPassword")}
                  </ThemedText>
                </Link>
              </ThemedView>
            </ThemedView>

            <ThemedView style={styles.textRowCheckbox}>
              <ThemedCheckbox
                value={rememberMe}
                onValueChange={(newValue) => setToggleCheckBox(newValue)}
              />
              <Pressable onPress={() => setToggleCheckBox(!rememberMe)}>
                <ThemedText>{i18n.t("rememberMe")}</ThemedText>
              </Pressable>
            </ThemedView>

            <ThemedButton
              style={styles.btn}
              onPress={handleSubmit}
              disabled={isLoading}
              loading={isLoading}
            >
              {i18n.t("loginButton")}
            </ThemedButton>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      <ThemedView safe={true} style={styles.bottomLinkContainer}>
        <ThemedView style={styles.textRow}>
          <ThemedText>{i18n.t("notRegisteredYet")}</ThemedText>
          <Link href="/register" replace asChild>
            <ThemedText
              lightColor={currentColors.primary}
              darkColor={currentColors.primary}
            >
              {i18n.t("createAccount")}
            </ThemedText>
          </Link>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
    gap: 30,
    paddingHorizontal: 20,
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
  textRowCheckbox: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "flex-start",
    alignItems: "center",
    marginLeft: 3,
  },
  passwordSection: {
    gap: 7,
  },
  formSection: {
    gap: 22,
  },
  flexEnd: {
    alignSelf: "flex-end",
  },
  login: {
    alignSelf: "flex-start",
  },
  bottomLinkContainer: {
    position: "absolute",
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: "center",
  },
});
