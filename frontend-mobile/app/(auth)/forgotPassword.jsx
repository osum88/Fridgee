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
import { FormGroup } from "../../components/input/FormGroup";
import { useState, useEffect } from "react";
import useForgotPasswordMutation from "@/hooks/auth/useForgotPasswordMutation";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveSize } from "@/utils/scale";

export default function ForgotPassword() {
  const currentColors = useThemeColor();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const { forgotPasswordMutation } = useForgotPasswordMutation();

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  useEffect(() => {
    let timerId;
    if (countdown > 0) {
      timerId = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else {
      setIsButtonDisabled(false);
      clearInterval(timerId);
    }

    return () => clearInterval(timerId);
  }, [countdown]);

  const handleSubmit = () => {
    setError(null);
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email) {
      setError(i18n.t("errorEmptyEmail"));
    } else if (!emailRegex.test(email)) {
      setError(i18n.t("errorValidEmail"));
    } else {
      forgotPasswordMutation.mutate({ email });

      setCountdown(10);
      setIsButtonDisabled(true);
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
              { width: isTablet ? "80%" : "100%" },
            ]}
          >
            <ThemedText style={styles.title} type="title">
              {i18n.t("forgotPassword")}
            </ThemedText>
            <ThemedText style={styles.description}>
              {i18n.t("forgotPasswordDescription")}
            </ThemedText>

            <ThemedView style={styles.formsButtonContainer}>
              <FormGroup
                label={i18n.t("emailAddress")}
                placeholder={i18n.t("enterYourEmail")}
                keyboardType="email-address"
                autoComplete="email"
                style={styles.input}
                autoCapitalize="none"
                value={email?.replace(/\s+/g, "")}
                onChangeText={setEmail}
                error={error}
              />

              <ThemedButton
                style={styles.btn}
                onPress={handleSubmit}
                disabled={isButtonDisabled}
              >
                {isButtonDisabled
                  ? `${i18n.t("resendIn")} ${countdown} s`
                  : i18n.t("resetPasswordLink")}
              </ThemedButton>
            </ThemedView>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>

      <ThemedView safe={true} style={styles.bottomLinkContainer}>
        <Link href="/login" dismissTo asChild>
          <ThemedText
            lightColor={currentColors.primary}
            darkColor={currentColors.primary}
          >
            {i18n.t("backToLogin")}
          </ThemedText>
        </Link>
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
    paddingVertical: responsiveSize.vertical(18),
  },
  contentWrapper: {
    gap: responsiveSize.vertical(26),
    paddingHorizontal: responsiveSize.horizontal(18),
  },
  title: {
    alignSelf: "flex-start",
  },
  description: {
    alignSelf: "flex-start",
  },
  btn: {
    paddingVertical: responsiveSize.vertical(14),
    width: "100%",
  },
  input: {
    paddingVertical: responsiveSize.vertical(16),
    width: "100%",
  },
  bottomLinkContainer: {
    position: "absolute",
    bottom: responsiveSize.vertical(13),
    left: 0,
    right: 0,
    alignItems: "center",
  },
  formsButtonContainer: {
    gap: responsiveSize.vertical(12),
  },
});
