import i18n from "@/constants/translations";
import { responsiveSize } from "@/utils/scale";
import { memo } from "react";
import { ActivityIndicator } from "react-native-paper";
import { ThemedText } from "@/components/themed/ThemedText";

const SaveButtonContentComponent = ({ isSubmitting, color, text }) => {
  if (isSubmitting) {
    return <ActivityIndicator size="small" color={color} />;
  }
  return (
    <ThemedText
      style={{
        color: color,
        fontSize: responsiveSize.moderate(18),
        fontWeight: "600",
      }}
    >
      {i18n.t(text)}
    </ThemedText>
  );
};

export const SaveButtonContent = memo(SaveButtonContentComponent);
