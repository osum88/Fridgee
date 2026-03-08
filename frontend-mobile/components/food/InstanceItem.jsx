import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import { responsiveSize } from "@/utils/scale";
import i18n from "@/constants/translations";
import { formatDate, formatAmount, formatPrice } from "@/utils/stringUtils";

const ITEM_HEIGHT = responsiveSize.vertical(60);

export const getExpirationColor = (dateStr, colors) => {
  if (!dateStr) return null;
  const now = new Date();
  const exp = new Date(dateStr);
  const diffDays = Math.ceil((exp - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return colors.expiredCount;
  if (diffDays <= 7) return colors.expiringSoonCount;
  return colors.validCount;
};

const InstanceItemComponent = ({ item, colors, borderColor, onPress }) => {
  const expColor = getExpirationColor(item.expirationDate, colors);
  const hasPrice = !!item.price;
  const hasAmount = !!item.amount;
  const hasDate = !!item.expirationDate;

  return (
    <Pressable
      onPress={() => onPress(item)}
      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
    >
      <ThemedView style={[styles.instanceWrapper, { borderColor }]} darkColor={colors.surface}>
        <View
          style={[styles.instanceAccent, { backgroundColor: expColor ?? colors.text + "30" }]}
        />

        <View style={styles.instanceContent}>
          {/* datum */}
          <View style={styles.instanceDateRow}>
            {hasDate ? (
              <>
                <IconSymbol
                  name="calendar"
                  size={responsiveSize.moderate(13)}
                  color={expColor ?? colors.text + "66"}
                />
                <ThemedText style={[styles.instanceDate, { color: expColor ?? colors.text }]}>
                  {formatDate(item.expirationDate)}
                </ThemedText>
              </>
            ) : (
              <ThemedText style={[styles.instanceNoDate, { color: colors.text + "86" }]}>
                {i18n.t("noExpirationDate")}
              </ThemedText>
            )}
          </View>

          {/* amount + price */}
          {hasAmount || hasPrice ? (
            <View style={styles.instanceMeta}>
              {hasAmount ? (
                <ThemedText style={[styles.instanceMetaText, { color: colors.text + "86" }]}>
                  {formatAmount(item.amount, item.unit)}
                </ThemedText>
              ) : null}
              {hasPrice ? (
                <ThemedText style={[styles.instanceMetaText, { color: colors.text + "86" }]}>
                  {formatPrice(item.price, item.currency)}
                </ThemedText>
              ) : null}
            </View>
          ) : null}
        </View>

        {/* count  */}
        <View style={styles.countBadge}>
          <ThemedText style={styles.countText}>
            {item.count}
            {"\u00d7"}
          </ThemedText>
        </View>
      </ThemedView>
    </Pressable>
  );
};

export const InstanceItem = React.memo(
  InstanceItemComponent,
  (prev, next) =>
    prev.item.instanceIds[0] === next.item.instanceIds[0] &&
    prev.item.count === next.item.count &&
    prev.item.expirationDate === next.item.expirationDate &&
    prev.item.amount === next.item.amount &&
    prev.item.unit === next.item.unit && 
    prev.item.price === next.item.price && 
    prev.item.currency === next.item.currency && 
    prev.borderColor === next.borderColor,
);

const styles = StyleSheet.create({
  instanceWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: ITEM_HEIGHT,
  },
  instanceAccent: {
    width: 3,
    alignSelf: "stretch",
  },
  instanceContent: {
    flex: 1,
    paddingVertical: responsiveSize.vertical(12),
    paddingHorizontal: responsiveSize.horizontal(12),
    gap: responsiveSize.vertical(4),
  },
  instanceDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(5),
  },
  instanceDate: {
    fontSize: responsiveSize.moderate(14),
    fontWeight: "600",
  },
  instanceNoDate: {
    fontSize: responsiveSize.moderate(13),
    fontStyle: "italic",
  },
  instanceMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: responsiveSize.horizontal(6),
  },
  instanceMetaText: {
    fontSize: responsiveSize.moderate(12),
    paddingRight: 8,
  },
  countBadge: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveSize.horizontal(12),
  },
  countText: {
    fontSize: responsiveSize.moderate(16),
    fontWeight: "300",
  },
});
