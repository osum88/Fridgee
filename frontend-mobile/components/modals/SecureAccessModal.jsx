import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
} from "@/utils/scale";
import { useState } from "react";
import { FormGroupPassword } from "@/components/input/FormGroupPassword";
import { ThemedButton } from "@/components/themed/ThemedButton";
import Tooltip from "react-native-walkthrough-tooltip";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { ThemedView } from "@/components/themed/ThemedView";
import useGetBankNumberPassword from "@/hooks/user/useGetBankNumberPassword";

export function SecureAccessModal({
  visible,
  setVisible,
  type,
  onPress,
  onChangeText,
  ...props
}) {
  const [password, setPassword] = useState(null);
  const [error, setError] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const color = useThemeColor();
  const { getBankNumberPassword, isLoading } = useGetBankNumberPassword();

  //zavreni modalu
  const handleClose = () => {
    if (isLoading) return;
    setTimeout(() => setVisible(false), 10);
    setPassword("");
  };

  //odeslani hesla
  const handleSubmit = () => {
    if (!password) return;

    getBankNumberPassword.mutate(
      { password },
      {
        onSuccess: (response) => {
          if (onChangeText) {
            onChangeText(response?.data);
          }
          onPress?.();
          handleClose();
        },
        onError: (error) => {
          setError(error.message);
        },
      }
    );
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        style={[styles.dialogContainer, { backgroundColor: color.background }]}
        onDismiss={handleClose}
        {...props}
      >
        <Dialog.Content style={styles.dialogContent}>
          <ThemedView style={styles.containerTitle}>
            <ThemedText style={styles.dialogTitle}>
              {type === "iban"
                ? i18n.t("showIban")
                : i18n.t("showBankAccountNumber")}
            </ThemedText>

            <Tooltip
              isVisible={showTooltip}
              content={
                <ThemedText
                  style={{
                    maxWidth: responsiveSize.horizontal(270),
                    lineHeight: responsiveVertical(21),
                  }}
                >
                  {i18n.t("showBankAccountNumberTip")}
                </ThemedText>
              }
              placement="bottom"
              contentStyle={{ backgroundColor: color.surface }}
              tooltipStyle={{ marginTop: responsiveSize.vertical(-40) }}
              style={{ maxWidth: responsiveSize.horizontal(270) }}
              onClose={() => setShowTooltip(false)}
              showChildInTooltip={false}
            >
              <TouchableOpacity onPress={() => setShowTooltip(true)}>
                <IconSymbol
                  size={responsiveSize.moderate(24)}
                  name={"info.circle"}
                  color={color.inputText}
                />
              </TouchableOpacity>
            </Tooltip>
          </ThemedView>
          <ThemedText style={styles.dialogText}>
            {type === "iban"
              ? i18n.t("showIbanDescription")
              : i18n.t("showBankAccountNumberDescription")}
          </ThemedText>

          <FormGroupPassword
            label={i18n.t("password")}
            placeholder={i18n.t("enterYourPassword")}
            style={styles.input}
            maxLength={100}
            autoCapitalize="none"
            importantForAutofill="no"
            value={password?.replace(/\s+/g, "")}
            onChangeText={(text) => {
              setPassword(text);
              setError("");
            }}
            error={error}
            showError={error}
          />
        </Dialog.Content>

        <Dialog.Actions style={styles.dialogActions}>
          <ThemedButton
            onPress={handleSubmit}
            style={styles.btn}
            disabled={isLoading}
            loading={isLoading}
          >
            {i18n.t("show")}
          </ThemedButton>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    width: "90%",
    maxWidth: 400,
    alignSelf: "center",
    borderRadius: responsiveSize.moderate(12, 0.3),
  },
  dialogContent: {
    alignItems: "flex-start",
  },
  containerTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  dialogTitle: {
    fontSize: responsiveFont(21),
    fontWeight: "bold",
    lineHeight: responsiveVertical(25),
    marginBottom: responsiveSize.vertical(12),
  },
  dialogText: {
    fontSize: responsiveFont(15),
    lineHeight: responsiveVertical(20),
    marginBottom: responsiveSize.vertical(16),
  },
  dialogActions: {
    flexDirection: "column",
    marginTop: responsiveSize.vertical(-17),
    paddingBottom: responsiveSize.vertical(16),
  },
  input: {
    paddingVertical: responsiveSize.vertical(15),
    width: "100%",
  },
  btn: {
    paddingVertical: responsiveSize.vertical(14),
    width: "100%",
  },
});
