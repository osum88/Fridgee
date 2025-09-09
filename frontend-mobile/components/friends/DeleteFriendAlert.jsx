import { ThemedText } from "@/components/themed/ThemedText";
import { Image, StyleSheet, TouchableOpacity } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeColor } from "@/hooks/useThemeColor";
import i18n from "@/constants/translations";

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
    borderRadius: 12,
  },
  dialog: {
    alignItems: "center",
    gap: 22,
  },
  alertProfileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginTop: 10,
  },
  dialogText: {
    textAlign: "center",
    fontSize: 16,
    lineHeight: 22,
  },
  username: {
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 13,
    paddingBottom: 13,
  },
  actionButton: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  pressed: {
    opacity: 0.8,
  },
});
