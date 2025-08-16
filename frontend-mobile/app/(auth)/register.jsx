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

export default function Register() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const [password, setPassword] = useState("");
  const [confirmPassword, setconfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  const handleSubmit = () => {
    setError("null");

    console.log("username is ", username);
    console.log("email is ", email);
    console.log("password is ", password);
    console.log("confirmPassword is ", confirmPassword);
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
                maxLength={20}
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                error={error}
              />
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                error={error}
              />
              <FormGroupPassword
                label={i18n.t("password")}
                placeholder={i18n.t("enterYourPassword")}
                style={styles.input}
                maxLength={70}
                importantForAutofill="no"
                value={password}
                onChangeText={setPassword}
                error={error}
              />
              <FormGroupPassword
                label={i18n.t("confirmPassword")}
                placeholder={i18n.t("passwordAgain")}
                style={styles.input}
                maxLength={70}
                importantForAutofill="no"
                value={confirmPassword}
                onChangeText={setconfirmPassword}
                error={error}
              />
            </ThemedView>

            <ThemedButton onPress={handleSubmit} style={styles.btn}>
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
