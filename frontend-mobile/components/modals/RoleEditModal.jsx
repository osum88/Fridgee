import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View, Modal } from "react-native";
import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { CheckableItem } from "@/components/common/CheckableItem";
import { responsiveFont, responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { ROLE_LABEL_MAP, ROLES } from "@/constants/inventory";

export const RoleEditModal = ({ visible, user, currentUserRole, onClose, onConfirm, colors }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role);
  const [showOwnerWarning, setShowOwnerWarning] = useState(false);

  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
    }
  }, [user]);

  const handleConfirm = () => {
    if (selectedRole === "OWNER" && currentUserRole === "OWNER") {
      setShowOwnerWarning(true);
      return;
    }
    onConfirm(user, selectedRole);
    onClose();
  };

  const handleOwnerWarningConfirm = () => {
    setShowOwnerWarning(false);
    onConfirm(user, selectedRole);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {showOwnerWarning ? (
            <>
              <ThemedText style={styles.modalTitle}>
                {i18n.t("ownerTransferWarningTitle")}
              </ThemedText>
              <ThemedText style={[styles.modalSubtitle, { color: colors.text + "99" }]}>
                {i18n.t("ownerTransferWarningDescription")}
              </ThemedText>
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.surface }]}
                  onPress={() => setShowOwnerWarning(false)}
                >
                  <ThemedText style={styles.modalBtnText}>{i18n.t("cancel")}</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.error }]}
                  onPress={handleOwnerWarningConfirm}
                >
                  <ThemedText style={[styles.modalBtnText, { color: "#fff" }]}>
                    {i18n.t("confirm")}
                  </ThemedText>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <ThemedText style={styles.modalTitle}>{i18n.t("changeRole")}</ThemedText>
              {ROLES.map((role) => (
                <ThemedView key={role} style={styles.checkableContainer}>
                  <ThemedText style={styles.checkableText}>{"•"}</ThemedText>
                  <CheckableItem
                    label={ROLE_LABEL_MAP[role]}
                    value={role}
                    selected={selectedRole === role}
                    onPress={setSelectedRole}
                    outlineStyle={styles.checkableItem}
                  />
                </ThemedView>
              ))}
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.surface }]}
                  onPress={onClose}
                >
                  <ThemedText style={styles.modalBtnText}>{i18n.t("cancel")}</ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                  onPress={handleConfirm}
                >
                  <ThemedText style={[styles.modalBtnText, { color: colors.onPrimary }]}>
                    {i18n.t("save")}
                  </ThemedText>
                </Pressable>
              </View>
            </>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(24),
  },
  modalContent: {
    width: "100%",
    borderRadius: responsiveSize.moderate(16),
    padding: responsiveSize.moderate(20),
  },
  modalTitle: {
    fontSize: responsiveFont(17),
    fontWeight: "600",
    marginBottom: responsiveSize.vertical(10),
  },
  modalSubtitle: {
    marginBottom: responsiveSize.vertical(8),
    fontSize: responsiveFont(13.5),
    lineHeight: responsiveSize.vertical(17),
  },
  modalActions: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(10),
    marginTop: responsiveSize.vertical(8),
  },
  modalBtn: {
    flex: 1,
    paddingVertical: responsiveSize.vertical(11),
    borderRadius: responsiveSize.moderate(10),
    alignItems: "center",
  },
  modalBtnText: {
    fontSize: responsiveFont(15),
    fontWeight: "500",
  },
  checkableContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(14),
    marginLeft: responsiveSize.horizontal(4),
  },
  checkableItem: {
    minHeight: responsiveSize.vertical(48),
    flex: 1,
  },
  checkableText: {
    fontSize: responsiveSize.moderate(20),
  },
});
