import { useWindowDimensions, ScrollView, StyleSheet } from "react-native";
import i18n from "@/constants/translations";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedButton } from "@/components/themed/ThemedButton";
import { useEffect, useState } from "react";
import useVerifyEmailMutation from "@/hooks/auth/useVerifyEmailMutation";
import { SuccessAnimation } from "@/components/animated/SuccessAnimation";
import { JumpingDots } from "@/components/animated/JumpingDots";
import { useUser } from "@/hooks/useUser";

export default function EmailVerify() {
  const { isAuthenticated } = useUser();
  const [isTokenVerified, setIsTokenVerified] = useState("wait");

  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { verifyEmailMutation } = useVerifyEmailMutation({
    setIsTokenVerified,
  });

  const { token } = useLocalSearchParams();

  useEffect(() => {
    if (!token) {
      console.error("Token missing");
      setIsTokenVerified("error");
    } else {
      console.log("Token received, verifying...");
      verifyEmailMutation.mutate({ token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isTokenVerified === "error") {
      router.replace("/resendVerifyEmail");
      console.log("Send Email...");
    }
  }, [isTokenVerified]);

  const handleContinue = async () => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  };

  return (
    <ThemedView safe={true} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <ThemedView
          style={[styles.contentWrapper, { width: isTablet ? "50%" : "100%" }]}
        >
          {isTokenVerified === "verify" ? (
            <>
              <SuccessAnimation />
              <ThemedView style={styles.changeSuccesfullyContainer}>
                <ThemedText style={styles.changeSuccesfully} type="title">
                  {i18n.t("success")}
                </ThemedText>
                <ThemedView style={styles.changeSuccesfullyText}>
                  <ThemedText style={[{ textAlign: "center" }]}>
                    {i18n.t("emailVerified")}
                  </ThemedText>
                  <ThemedText style={[{ textAlign: "center" }]}>
                    {i18n.t("continueNow")}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            </>
          ) : (
            <>
              <JumpingDots>{i18n.t("loadingVerifyingEmail")}</JumpingDots>
            </>
          )}
        </ThemedView>
      </ScrollView>

      {isTokenVerified === "verify" && (
        <ThemedView
          safe={true}
          style={[
            styles.bottomButtonContainer,
            { width: isTablet ? "50%" : "100%" },
          ]}
        >
          <ThemedButton onPress={handleContinue} style={[styles.btn]}>
            {i18n.t("continue")}
          </ThemedButton>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
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
  loadingText: {},
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
    alignSelf: "center",
    position: "absolute",
    width: "100%",
    paddingHorizontal: 16,
    bottom: 30,
  },
});
