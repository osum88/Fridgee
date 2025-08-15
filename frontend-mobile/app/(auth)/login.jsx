import { Dimensions, ScrollView, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import i18n from "@/constants/translations";
import { Link } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedButton } from "@/components/themed/ThemedButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { FormGroup } from "../../components/common/FormGroup";
import { FormGroupPassword } from "../../components/common/FormGroupPassword";
import { useState } from "react";
import Checkbox from 'expo-checkbox';



export default function Login() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const [password, setPassword] = useState("");
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

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
            <ThemedText style={styles.login} type="title">{i18n.t("login")}</ThemedText>
            <ThemedView style={styles.inputsGap}>
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                style={[styles.input, { width: screenWidth }]}
              />
              
              <ThemedView style={styles.inputGap}>
                <FormGroupPassword
                  label={i18n.t("password")}
                  placeholder={i18n.t("enterYourPassword")}
                  style={[styles.input, { width: screenWidth }]}
                  value={password}
                  onChangeText={setPassword}
                />
                <ThemedText style={styles.flexEnd} lightColor={currentColors.primary} darkColor={currentColors.primary}>
                  {i18n.t("forgotPassword")}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            <ThemedView>
              <ThemedText>{i18n.t("rememberMe")}</ThemedText>
                <Checkbox
                  value={toggleCheckBox}
                  onValueChange={(newValue) => setToggleCheckBox(newValue)}
                />
            </ThemedView>


    
            <ThemedButton style={[styles.btn, { width: screenWidth }]}>
              {i18n.t("loginButton")}
            </ThemedButton>

            <ThemedView style={styles.textRow}>
              <ThemedText>{i18n.t("notRegisteredYet")}</ThemedText>
              <Link href="/register" replace asChild>
                <ThemedText lightColor={currentColors.primary} darkColor={currentColors.primary}>
                  {i18n.t("createAccount")}
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
  inputGap: {
    gap: 7,
  },
  inputsGap: {
    gap: 22,
  },
  flexEnd: {
    alignSelf: "flex-end",
  },
  login: {
    alignSelf: "flex-start",
  },
});