import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { Pressable, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import i18n from "@/constants/translations";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export function FriendActionButton({
  status = null,
  textButton = "",
  isRequestSend = true,
  icon,
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

  if (textButton === "accept" || icon === "checkmark") {
    variant = "accept";
  } else if (textButton === "decline" || icon === "xmark") {
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
        {icon ? (
          <IconSymbol
            size={responsiveSize.moderate(23)}
            name={icon}
            color={colorText}
            style={styles.iconCheck}
          />
        ) : (
          label
        )}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: responsiveFont(9, 0, 3),
    minHeight: responsiveSize.vertical(28),
    minWidth: responsiveSize.horizontal(100),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(11),
    paddingVertical: responsiveSize.vertical(2),
  },
  pressed: {
    opacity: 0.9,
  },
  text: {
    fontWeight: "500",
  },
  iconCheck: {
    fontWeight: "bold",
  },
});
