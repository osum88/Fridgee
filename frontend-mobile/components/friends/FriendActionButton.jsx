import { useThemeColor } from "@/hooks/useThemeColor";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import i18n from "@/constants/translations";

export function FriendActionButton({
  status = null,
  textButton = "",
  isRequestSend = true,
  style,
  ...props
}) {
  const color = useThemeColor();

  const BUTTON_STYLES = {
    default: {
      colorButton: color.noneButton,
      colorText: color.onPrimary,
      label: i18n.t("addFriend"),
    },
    pending: {
      colorButton: color.pendingButton,
      colorText: color.pendingTextButton,
      label: i18n.t("cancelRequest"),
    },
    accepted: {
      colorButton: color.pendingButton,
      colorText: color.pendingTextButton,
      label: i18n.t("friends"),
    },
    accept: {
      colorButton: color.noneButton,
      colorText: color.onPrimary,
      label: i18n.t("acceptRequest"),
    },
    decline: {
      colorButton: color.pendingButton,
      colorText: color.pendingTextButton,
      label: i18n.t("rejectRequest"),
    },
  };

  let variant = "default";

  if (status) {
    const statusLowCase = status.toLowerCase();

    if (statusLowCase === "pending" && isRequestSend) {
      variant = "pending";
    } else if (statusLowCase === "accepted") {
      variant = "accepted";
    }
  }

  if (textButton === "Přijmout") {
    variant = "accept";
  } else if (textButton === "Odmítnout") {
    variant = "decline";
  }

  const { colorButton, colorText, label } = BUTTON_STYLES[variant];

  return (
    <Pressable
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.btn,
        pressed && styles.pressed,
        { backgroundColor: colorButton },
        style,
      ]}
    >
      <ThemedText style={[styles.text, { color: colorText }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 10,
    height: 32,
    minWidth: 110,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    fontWeight: "500",
  },
});
