import React from "react";
import { View, StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { responsiveSize, responsiveFont } from "@/utils/scale";
import { formatDate, formatAmount, getAmountTexts, formatPrice } from "@/utils/stringUtils";
import i18n from "@/constants/translations";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { ACTION_COLORS } from "@/constants/colors";

// render detailu
const renderDetails = (item, colors) => {
  const {
    action,
    metadata,
    price,
    quantityBefore,
    quantityAfter,
    currency,
    snapshotUnit: unit,
    currentAmount: amount,
    snapshotExpirationDate: expirationDate,
  } = item;

  const rows = [];

  if ((quantityBefore || quantityAfter) && quantityBefore !== quantityAfter) {
    rows.push(
      <DetailRow
        key="quantity"
        label={i18n.t("itemCount")}
        before={quantityBefore}
        after={quantityAfter}
        colors={colors}
      />,
    );
  }

  const isMetadataAmount = !!metadata?.amount || !!metadata?.unit;
  const isSnapshotAmount = !!amount || !!unit;

  if (isMetadataAmount) {
    const beforeUnit = metadata?.unit?.before === undefined ? unit : metadata?.unit?.before;
    const afterUnit = metadata?.unit?.after === undefined ? unit : metadata?.unit?.after;
    const beforeAmount = metadata?.amount?.before === undefined ? amount : metadata?.amount?.before;
    const afterAmount = metadata?.amount?.after === undefined ? amount : metadata?.amount?.after;
    rows.push(
      <DetailRow
        key="amount"
        label={getAmountTexts(unit)?.label}
        before={formatAmount(beforeAmount, beforeUnit)}
        after={formatAmount(afterAmount, afterUnit)}
        colors={colors}
      />,
    );
  }

  if (action === "ADD" || action === "CONSUME" || action === "REMOVE") {
    if (isSnapshotAmount && !isMetadataAmount) {
      rows.push(
        <DetailRow
          key="amountAdd"
          label={getAmountTexts(unit)?.label}
          after={formatAmount(amount, unit)}
          colors={colors}
        />,
      );
    }
    if (price) {
      rows.push(
        <DetailRow
          key="priceAdd"
          label={i18n.t("price")}
          after={formatPrice(price, currency)}
          colors={colors}
        />,
      );
    }

    if (expirationDate) {
      rows.push(
        <DetailRow
          key="expAdd"
          label={i18n.t("expirationDate")}
          after={expirationDate ? formatDate(expirationDate, true) : null}
          colors={colors}
        />,
      );
    }
  }

  if (!metadata || typeof metadata !== "object") {
    return rows.length > 0 ? <View style={styles.detailContainer}>{rows}</View> : null;
  }

  if (metadata.foodCategory) {
    const { before, after } = metadata.foodCategory;
    rows.push(
      <DetailRow
        key="category"
        label={i18n.t("category")}
        before={before === null && action !== "CATEGORY_CREATE" ? i18n.t("noCategory") : before}
        after={after}
        colors={colors}
      />,
    );
  }

  if (metadata.variant) {
    const { before, after } = metadata.variant;
    rows.push(
      <DetailRow
        key="variant"
        label={i18n.t("variant")}
        before={before || "—"}
        after={after}
        colors={colors}
      />,
    );
  }

  if (metadata.price) {
    const { before, after } = metadata.price;
    rows.push(
      <DetailRow
        key="price"
        label={i18n.t("price")}
        before={formatPrice(before, currency)}
        after={formatPrice(after, currency)}
        colors={colors}
      />,
    );
  }

  if (metadata.expirationDate) {
    const { before, after } = metadata.expirationDate;
    rows.push(
      <DetailRow
        key="exp"
        label={i18n.t("expirationDate")}
        before={before ? formatDate(before, true) : null}
        after={after ? formatDate(after, true) : null}
        colors={colors}
      />,
    );
  }

  if (metadata.minimalQuantity) {
    const { before, after } = metadata.minimalQuantity;
    rows.push(
      <DetailRow
        key="minQty"
        label={i18n.t("minimalQuantity")}
        before={before}
        after={after}
        colors={colors}
      />,
    );
  }

  if (metadata.defaultLabel) {
    const { before, after } = metadata.defaultLabel;
    rows.push(
      <DetailRow
        key="label"
        label={i18n.t("defaultFoodLabel")}
        before={before}
        after={after}
        colors={colors}
      />,
    );
  }
  return rows.length > 0 ? <View style={styles.detailContainer}>{rows}</View> : null;
};

//radek detailu
const DetailRow = ({ label, before, after, colors }) => (
  <View style={styles.detailRow}>
    <ThemedText style={[styles.detailLabel, { color: colors.text + "88" }]}>{label}</ThemedText>
    <View style={styles.detailValues}>
      {before !== null && before !== undefined && (
        <>
          <ThemedText style={[styles.detailValue, { color: colors.text + "77" }]}>
            {String(before)}
          </ThemedText>
          <IconSymbol
            name="arrow.right"
            size={responsiveSize.moderate(10)}
            color={colors.text + "77"}
          />
        </>
      )}
      <ThemedText style={[styles.detailValue, { color: colors.text }]}>
        {after !== null && after !== undefined ? String(after) : "—"}
      </ThemedText>
    </View>
  </View>
);

//item historie
const HistoryItemComponent = ({ item, colors, colorScheme }) => {
  const { action } = item;
  const SHOW_BADGE = item.itemsCount > 1 && !["ADD", "REMOVE", "CONSUME"].includes(action);

  const actionColor = ACTION_COLORS[colorScheme ?? "light"]?.[action] ?? colors.primary;

  return (
    <View
      style={[
        styles.item,
        { backgroundColor: colors.cardBackground, borderColor: colors.borderCard },
      ]}
    >
      {/* leva barevna cara */}
      <View style={[styles.actionBar, { backgroundColor: actionColor }]} />

      <View style={styles.itemContent}>
        {/* akce, a cas */}
        <View style={styles.topRow}>
          <View style={styles.actionRow}>
            <ThemedText style={[styles.action, { color: actionColor }]}>
              {i18n.t(`historyAction.${item.action}`)}
            </ThemedText>
            {SHOW_BADGE && (
              <View style={[styles.badge, { backgroundColor: actionColor + "22" }]}>
                <ThemedText style={[styles.badgeText, { color: actionColor }]}>
                  {item.itemsCount}
                  {"\u00d7"}
                </ThemedText>
              </View>
            )}
          </View>
          <View style={styles.timeCol}>
            <ThemedText style={[styles.timeText, { color: colors.text + "75" }]}>
              {new Date(item.changedAt).toLocaleDateString()}
            </ThemedText>
            <ThemedText style={[styles.timeText, { color: colors.text + "75" }]}>
              {new Date(item.changedAt).toLocaleTimeString("cs-CZ", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </ThemedText>
          </View>
        </View>

        {/* nazev a varianta */}
        {item.title && (
          <ThemedText style={styles.title} numberOfLines={1}>
            {item.title}
          </ThemedText>
        )}
        {item.variant && (
          <ThemedText style={[styles.variant, { color: colors.text + "77" }]} numberOfLines={1}>
            {item.variant}
          </ThemedText>
        )}

        {/* detail */}
        {renderDetails(item, colors)}

        {/* uzivatel */}
        <ThemedText style={[styles.user, { color: colors.text + "55" }]} numberOfLines={1}>
          {item.user}
        </ThemedText>
      </View>
    </View>
  );
};

export const HistoryItem = React.memo(HistoryItemComponent);

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    borderRadius: responsiveSize.moderate(6),
    marginBottom: responsiveSize.vertical(10),
    overflow: "hidden",
    borderWidth: 1,
    borderLeftWidth: 0,
  },
  actionBar: {
    width: 5,
  },
  itemContent: {
    flex: 1,
    padding: responsiveSize.moderate(12),
    gap: responsiveSize.vertical(3),
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: responsiveSize.vertical(4),
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(5),
    flex: 1,
  },
  action: {
    fontSize: responsiveFont(12),
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: responsiveSize.horizontal(6),
    paddingVertical: responsiveSize.vertical(1),
    borderRadius: responsiveSize.moderate(6),
  },
  badgeText: {
    fontSize: responsiveFont(11),
    fontWeight: "600",
  },
  timeCol: {
    alignItems: "flex-end",
    gap: responsiveSize.vertical(1),
  },
  timeText: {
    fontSize: responsiveFont(11),
  },
  title: {
    fontSize: responsiveFont(15),
    fontWeight: "600",
  },
  variant: {
    fontSize: responsiveFont(12),
  },
  user: {
    fontSize: responsiveFont(11),
    marginTop: responsiveSize.vertical(4),
  },
  detailContainer: {
    marginTop: responsiveSize.vertical(6),
    gap: responsiveSize.vertical(3),
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: responsiveFont(12),
  },
  detailValues: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(4),
  },
  detailValue: {
    fontSize: responsiveFont(12),
  },
});
