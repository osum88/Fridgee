import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export function ProfileImageSelector({
  visible,
  setVisible,
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
          <ThemedText style={styles.titleText}>Profile photo</ThemedText>
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color.surface }]}
            onPress={() => {
              handleClose();
              onPress?.("camera");
            }}
          >
            <IconSymbol
              size={responsiveSize.moderate(28)}
              name="camera"
              color={color.tabsText}
            />
            <ThemedText
              style={[styles.buttonLabel, { color: color.outlineButton }]}
            >
              {i18n.t("camera")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color.surface }]}
            onPress={() => {
              handleClose();
              onPress?.("photo");
            }}
          >
            <IconSymbol
              size={responsiveSize.moderate(28)}
              name="photo"
              color={color.tabsText}
            />
            <ThemedText
              style={[styles.buttonLabel, { color: color.outlineButton }]}
            >
              {i18n.t("gallery")}
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: color.surface }]}
            onPress={() => {
              handleClose();
              onPress?.("remove");
            }}
          >
            <IconSymbol
              size={responsiveSize.moderate(28)}
              name="trash"
              color={color.notFoccusIcon}
            />
            <ThemedText
              style={[styles.buttonLabel, { color: color.outlineButton }]}
            >
              {i18n.t("remove1")}
            </ThemedText>
          </TouchableOpacity>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialogContainer: {
    width: "85%",
    maxWidth: 600,
    alignSelf: "center",
    borderRadius: responsiveFont(16, 0.3),
  },
  dialog: {
    alignItems: "center",
  },
  titleText: {
    fontSize: responsiveSize.moderate(24, 0.4),
    lineHeight: responsiveSize.vertical(32),
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: responsiveSize.horizontal(20),
    paddingBottom: responsiveSize.vertical(22),
    gap: responsiveSize.horizontal(10),
  },
  actionButton: {
    flex: 1,
    borderRadius: responsiveFont(12, 0.3),
    paddingHorizontal: responsiveSize.horizontal(13),
    paddingVertical: responsiveSize.vertical(8),
    alignItems: "center",
    justifyContent: "center",
  },
  buttonLabel: {
    fontSize: responsiveSize.moderate(11),
    fontWeight: "400",
    lineHeight: responsiveSize.vertical(16),
  },
  pressed: {
    opacity: 0.8,
  },
});
