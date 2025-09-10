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
import { responsiveSize } from "@/utils/scale";

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
          style={[styles.contentWrapper, { width: isTablet ? "80%" : "100%" }]}
        >
          {isTokenVerified === "verify" ? (
            <>
              <SuccessAnimation size={responsiveSize.vertical(100)} />
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
            { width: isTablet ? "70%" : "100%" },
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
    paddingVertical: responsiveSize.vertical(18),
  },
  contentWrapper: {
    alignItems: "center",
    gap: responsiveSize.vertical(18),
    paddingHorizontal: responsiveSize.horizontal(18),
    width: "100%",
  },
  btn: {
    paddingVertical: responsiveSize.vertical(14),
    width: "100%",
  },
  changeSuccesfully: {
    marginBottom: responsiveSize.vertical(6),
  },
  changeSuccesfullyContainer: {
    marginTop: responsiveSize.vertical(18),
    gap: responsiveSize.vertical(6),
    alignItems: "center",
  },
  changeSuccesfullyText: {
    gap: responsiveSize.vertical(2),
    alignItems: "center",
    textAlign: "center",
  },
  bottomButtonContainer: {
    alignSelf: "center",
    position: "absolute",
    width: "100%",
    paddingHorizontal: responsiveSize.horizontal(18),
    bottom: responsiveSize.vertical(28),
  },
});
