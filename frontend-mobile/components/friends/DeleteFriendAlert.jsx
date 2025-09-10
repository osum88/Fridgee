import { ThemedText } from "@/components/themed/ThemedText";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/constants/translations";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
} from "@/utils/scale";

export function DeleteFriendAlert({
  visible,
  setVisible,
  imageSource,
  username,
  onPress,
  ...otherProps
}) {
  const color = useThemeColor();

  const handleClose = () => {
    setTimeout(() => setVisible(false), 10);
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        style={[styles.dialogContainer, { backgroundColor: color.background }]}
        onDismiss={handleClose}
        {...otherProps}
      >
        <Dialog.Content style={styles.dialog}>
          <Image source={imageSource} style={styles.alertProfileImage} />

          <ThemedText style={styles.dialogText}>
            {i18n.t("removeFromFriends1")}{" "}
            <ThemedText style={styles.username}>{username}</ThemedText>{" "}
            {i18n.t("removeFromFriends2")}
          </ThemedText>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              { borderColor: color.outlineButton, marginRight: 10 },
            ]}
            onPress={() => handleClose()}
          >
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.buttonLabel, { color: color.outlineButton }]}
            >
              {i18n.t("cancel")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: color.removeButton,
                borderColor: color.removeButton,
              },
            ]}
            onPress={() => {
              handleClose();
              onPress?.();
            }}
          >
            <ThemedText
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.buttonLabel, { color: color.onPrimary }]}
            >
              {i18n.t("remove")}
            </ThemedText>
          </TouchableOpacity>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    width: "70%",
    maxWidth: 400,
    alignSelf: "center",
    borderRadius: responsiveFont(12, 0.3),
  },
  dialog: {
    alignItems: "center",
    gap: responsiveSize.horizontal(20),
  },
  alertProfileImage: {
    width: responsiveSize.moderate(85),
    height: responsiveSize.moderate(85),
    borderRadius: responsiveSize.moderate(70),
    marginTop: responsiveSize.vertical(9),
  },
  dialogText: {
    textAlign: "center",
    fontSize: responsiveFont(15),
    lineHeight: responsiveVertical(20),
  },
  username: {
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: responsiveSize.horizontal(12),
    paddingBottom: responsiveSize.vertical(12),
  },
  actionButton: {
    flex: 1,
    borderRadius: responsiveFont(8, 0.3),
    paddingHorizontal: responsiveSize.horizontal(9),
    paddingVertical: responsiveSize.vertical(7),
    alignItems: "center",
    justifyContent: "center",
    borderWidth: responsiveFont(1.5, 0.3),
  },
  buttonLabel: {
    fontSize: responsiveFont(13.5),
    fontWeight: "bold",
  },
  pressed: {
    opacity: 0.8,
  },
});
