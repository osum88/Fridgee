import { ThemedText } from "@/components/themed/ThemedText";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Dialog, Portal } from "react-native-paper";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import i18n from "@/constants/translations";
import { responsiveFont, responsiveSize, responsiveVertical } from "@/utils/scale";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { memo } from "react";
import { ImageViewer } from "@/components/image/ImageViewer";

function DeleteAlertComponent({
  visible,
  setVisible,
  title = "",
  description,
  deleteItem = "",
  questionMark = false,
  confirmLabel,
  onConfirm,
  imageSource = null,
  icon = "trash",
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
          {imageSource ? (
            <ImageViewer
              imageUrl={imageSource}
              isLoading={false}
              isImagePlaceholder={true}
              imageStyle={styles.alertProfileImage}
            />
          ) : (
            <View style={[styles.iconWrapper, { backgroundColor: color.errorBackground }]}>
              <IconSymbol name={icon} size={responsiveSize.moderate(28)} color={color.error} />
            </View>
          )}

          {title && <ThemedText style={styles.title}>{title}</ThemedText>}
          {description && (
            <ThemedText
              style={[
                styles.descriptionContainer,
                styles.description,
                { color: color.text + "99" },
              ]}
            >
              {Array.isArray(description) ? (
                <>
                  {description[0]}
                  {deleteItem && (
                    <ThemedText
                      style={[styles.description, { color: color.text + "99", fontWeight: "600" }]}
                    >
                      {" "}
                      {deleteItem}
                    </ThemedText>
                  )}
                  {questionMark ? "? " : " "}
                  {description[1]}
                </>
              ) : (
                description
              )}
            </ThemedText>
          )}
        </Dialog.Content>

        <Dialog.Actions style={styles.actions}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: color.surface }]}
            onPress={handleClose}
          >
            <ThemedText style={[styles.cancelLabel, { color: color.text }]}>
              {i18n.t("cancel")}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, { backgroundColor: color.error }]}
            onPress={() => {
              handleClose();
              onConfirm?.();
            }}
          >
            <IconSymbol name={icon} size={responsiveSize.moderate(14)} color="#fff" />
            <ThemedText style={styles.confirmLabel}>{confirmLabel ?? i18n.t("remove")}</ThemedText>
          </TouchableOpacity>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

export const DeleteAlert = memo(DeleteAlertComponent);

const styles = StyleSheet.create({
  dialogContainer: {
    width: "78%",
    maxWidth: 420,
    alignSelf: "center",
    borderRadius: responsiveFont(16, 0.3),
  },
  dialog: {
    alignItems: "center",
    gap: responsiveSize.vertical(10),
    paddingTop: responsiveSize.vertical(5),
  },
  iconWrapper: {
    width: responsiveSize.moderate(60),
    height: responsiveSize.moderate(60),
    borderRadius: responsiveSize.moderate(30),
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveSize.vertical(4),
  },
  title: {
    textAlign: "center",
    fontSize: responsiveFont(16),
    fontWeight: "700",
  },
  descriptionContainer: {
    paddingHorizontal: responsiveSize.horizontal(4),
  },
  description: {
    textAlign: "center",
    fontSize: responsiveFont(13.5),
    lineHeight: responsiveVertical(20),
  },
  actions: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(10),
    paddingHorizontal: responsiveSize.horizontal(16),
    paddingBottom: responsiveSize.vertical(16),
    paddingTop: responsiveSize.vertical(4),
  },
  cancelButton: {
    flex: 1,
    borderRadius: responsiveFont(10, 0.3),
    paddingVertical: responsiveSize.vertical(10),
    alignItems: "center",
    justifyContent: "center",
  },
  cancelLabel: {
    fontSize: responsiveFont(14),
    fontWeight: "600",
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    borderRadius: responsiveFont(10, 0.3),
    paddingVertical: responsiveSize.vertical(10),
    alignItems: "center",
    justifyContent: "center",
    gap: responsiveSize.horizontal(6),
  },
  confirmLabel: {
    fontSize: responsiveFont(14),
    fontWeight: "600",
    color: "#fff",
  },
  alertProfileImage: {
    width: responsiveSize.moderate(80),
    height: responsiveSize.moderate(80),
    borderRadius: responsiveSize.moderate(70),
  },
});
