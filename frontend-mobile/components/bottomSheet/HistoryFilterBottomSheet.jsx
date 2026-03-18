import React, { useEffect, useState } from "react";
import { StyleSheet, View, Pressable, Platform } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { BaseBottomSheet } from "@/components/bottomSheet/BaseBottomSheet";
import { DoubleInputRow } from "@/components/input/DoubleInputRow";
import { DateInput } from "@/components/input/DateInput";
import { ACTION_GROUPS } from "@/constants/history";
import { updateFormValues, resetErrors } from "@/utils/stringUtils";

const MIN_YEARS_IN_PAST = 10;

const validateDateRange = (filters) => {
  const now = new Date();
  const minDate = new Date();
  minDate.setFullYear(now.getFullYear() - MIN_YEARS_IN_PAST);

  const result = { ...filters };

  ["fromDate", "toDate"].forEach((key) => {
    if (!filters[key]) return;
    const date = new Date(filters[key]);
    if (isNaN(date.getTime()) || date > now || date < minDate) {
      delete result[key];
    }
  });
  return result;
};

const HistoryFilterSheetComponent = ({ visible, filters, users, onClose, onApply, colors }) => {
  const [errors, setErrors] = useState({});
  const [currentFilters, setCurrentFilters] = useState({});

  useEffect(() => {
    if (visible) {
      setCurrentFilters(filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  //nastaveni interni filtru
  const toggle = (key, value) => {
    const current = currentFilters[key] ?? [];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setCurrentFilters({ ...currentFilters, [key]: next.length ? next : undefined });
  };

  //nastaveni history filtru
  const onConfirm = () => {
    resetErrors(setErrors, errors);
    onApply(validateDateRange(currentFilters));
    onClose();
  };

  const isActive = (key, value) => (currentFilters[key] ?? []).includes(value);

  const hasFilters = Object.values(currentFilters).some(
    (v) => v !== undefined && v !== "" && (Array.isArray(v) ? v.length > 0 : true),
  );

  return (
    <BaseBottomSheet
      visible={visible}
      onClose={onClose}
      colors={colors}
      scrollable={true}
      maxHeightRatio={0.65}
      styleSheet={{ paddingHorizontal: responsiveSize.horizontal(16) }}
      contentStyle={{ flex: 1 }}
      bottom={false}
      footer={
        <Pressable
          onPress={onConfirm}
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
        >
          <IconSymbol
            name={"checkmark"}
            size={responsiveSize.moderate(32)}
            color={colors.onPrimary}
          />
        </Pressable>
      }
      // hlavicka
      header={
        <View style={styles.header}>
          <ThemedText style={styles.title}>{i18n.t("filters")}</ThemedText>
          {hasFilters && (
            <Pressable onPress={() => setCurrentFilters({})} hitSlop={8}>
              <ThemedText style={[styles.clearBtn, { color: colors.error }]}>
                {i18n.t("clearAllFilters")}
              </ThemedText>
            </Pressable>
          )}
        </View>
      }
    >
      {/* rozsah datumu od - do */}
      <ThemedText style={[styles.sectionLabel, { color: colors.text + "77" }]}>
        {i18n.t("dateRange")}
      </ThemedText>
      <DoubleInputRow
        ratio={[1, 1]}
        error={errors.fromDate || errors.toDate}
        leftComponent={
          <DateInput
            value={currentFilters.fromDate}
            onChange={(date) =>
              setCurrentFilters({ ...currentFilters, fromDate: date || undefined })
            }
            maxYearsInFuture={0}
            minYearsInPast={MIN_YEARS_IN_PAST}
            error={errors.fromDate}
            setError={(error) => updateFormValues(setErrors, "fromDate", error)}
            showError={false}
          />
        }
        rightComponent={
          <DateInput
            value={currentFilters.toDate}
            onChange={(date) => setCurrentFilters({ ...currentFilters, toDate: date || undefined })}
            maxYearsInFuture={0}
            minYearsInPast={MIN_YEARS_IN_PAST}
            error={errors.toDate}
            setError={(error) => updateFormValues(setErrors, "toDate", error)}
            showError={false}
          />
        }
      />
      {/* akce */}
      <View style={styles.chips}>
        {ACTION_GROUPS.map((group) => (
          <View key={group.labelKey}>
            <ThemedText
              style={[
                styles.sectionLabel,
                group.labelKey !== "foodActions" && styles.sectionTop,
                { color: colors.text + "77" },
              ]}
            >
              {i18n.t(group.labelKey)}
            </ThemedText>
            <View style={styles.chips}>
              {group.actions.map((action) => (
                <Pressable
                  key={action}
                  onPress={() => toggle("type", action)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isActive("type", action) ? colors.primary : colors.surface,
                      borderColor: isActive("type", action) ? colors.primary : colors.text + "22",
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.chipText,
                      { color: isActive("type", action) ? colors.onPrimary : colors.text },
                    ]}
                  >
                    {i18n.t(`historyActionChips.${action}`)}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* uzivatele */}
      {users?.length > 0 && (
        <>
          <ThemedText
            style={[styles.sectionLabel, styles.sectionTop, { color: colors.text + "77" }]}
          >
            {i18n.t("users")}
          </ThemedText>
          <View style={styles.chips}>
            {users.map((user) => (
              <Pressable
                key={user.userId}
                onPress={() => toggle("changedBy", user.userId)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isActive("changedBy", user.userId)
                      ? colors.primary
                      : colors.surface,
                    borderColor: isActive("changedBy", user.userId)
                      ? colors.primary
                      : colors.text + "22",
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    {
                      color: isActive("changedBy", user.userId) ? colors.onPrimary : colors.text,
                    },
                  ]}
                >
                  {user?.resultName}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </>
      )}

      <View style={styles.bottom} />
    </BaseBottomSheet>
  );
};

export const HistoryFilterSheet = React.memo(HistoryFilterSheetComponent);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveSize.vertical(20),
  },
  title: {
    fontSize: responsiveSize.moderate(17),
    fontWeight: "600",
  },
  clearBtn: {
    fontSize: responsiveSize.moderate(13),
    fontWeight: "500",
  },
  sectionLabel: {
    fontSize: responsiveSize.moderate(11),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: responsiveSize.vertical(9),
  },
  sectionTop: {
    marginTop: responsiveSize.vertical(9),
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: responsiveSize.moderate(8),
    marginBottom: responsiveSize.vertical(6),
  },
  chip: {
    paddingHorizontal: responsiveSize.horizontal(14),
    paddingVertical: responsiveSize.vertical(7),
    borderRadius: responsiveSize.moderate(20),
    borderWidth: 1,
  },
  chipText: {
    fontSize: responsiveSize.moderate(13),
    fontWeight: "500",
  },
  bottom: {
    height: Platform.OS === "ios" ? responsiveSize.vertical(52) : responsiveSize.vertical(38),
  },
  confirmBtn: {
    width: responsiveSize.horizontal(53),
    height: responsiveSize.vertical(53),
    borderRadius: responsiveSize.moderate(18),
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: responsiveSize.vertical(18),
    right: responsiveSize.horizontal(14),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
