import { Dimensions, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
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

export default function Register() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const [password, setPassword] = useState('');
  const [confirmPassword, setconfirmPassword] = useState('');

  const { width } = Dimensions.get("window");
  const isTablet = width >= 768;
  const screenWidth = isTablet ? width * 0.5 : width * 0.9;

  return (
    <ThemedView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
          <ThemedView style={styles.contentWrapper}>
            <ThemedText style={styles.register} type="title">{i18n.t("registration")}</ThemedText>
            <ThemedView style={styles.inputsGap}>
              <FormGroup
                label={i18n.t("username")}
                placeholder={i18n.t("enterYourUsername")}
                style={[styles.input, { width: screenWidth }]}
              />
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                style={[styles.input, { width: screenWidth }]}
              />
              <FormGroupPassword
                label={i18n.t("password")}
                placeholder={i18n.t("enterYourPassword")}
                style={[styles.input, { width: screenWidth }]}
                value={password}
                onChangeText={setPassword}
              />
              <FormGroupPassword
                label={i18n.t("confirmPassword")}
                placeholder={i18n.t("passwordAgain")}
                style={[styles.input, { width: screenWidth }]}
                value={confirmPassword}
                onChangeText={setconfirmPassword}
              />
            </ThemedView>
            <ThemedButton style={[styles.btn, { width: screenWidth }]}>
              {i18n.t("signUpButton")}
            </ThemedButton>
            <ThemedView style={styles.textRow}>
              <ThemedText>{i18n.t("alreadyHaveAnAccount")}</ThemedText>
              <Link href="/login" replace asChild>
                <ThemedText lightColor={currentColors.primary} darkColor={currentColors.primary}>
                  {i18n.t("loginNow")}
                </ThemedText>
              </Link>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
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
    gap: 36,
    paddingHorizontal: 20,
    width: "100%",
  },
  btn: {
    paddingVertical: 16,
  },
  input: {
    paddingVertical: 18,
  },
  textRow: {
    flexDirection: "row",
    gap: 5,
  },
  inputsGap: {
    gap: 22,
  },
  register: {
    alignSelf: "flex-start",
  },
});