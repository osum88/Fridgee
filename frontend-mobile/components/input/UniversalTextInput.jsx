import React, { memo, useMemo } from "react";
import { TextInput, HelperText } from "react-native-paper";
import { responsiveSize } from "@/utils/scale";
import { ThemedView } from "@/components/themed/ThemedView";
import { GET_INPUT_THEME_NATIVE_PAPER } from "@/constants/colors";
import { useThemeColor } from "@/hooks/colors/useThemeColor";

// obecny input
const UniversalTextInputComponent = ({
  error,
  typeError = "error",
  mode = "outlined",
  theme,
  showError = true,
  ...rest
}) => {
  const color = useThemeColor();

  const inputColor = useMemo(() => GET_INPUT_THEME_NATIVE_PAPER(color), [color]);

  return (
    <ThemedView>
      <TextInput mode={mode} error={!!error} theme={theme || inputColor} {...rest} />
      {showError && (
        <HelperText
          type={typeError}
          visible={!!error}
          style={{
            marginLeft: responsiveSize.horizontal(-9),
            marginTop: responsiveSize.vertical(-2),
          }}
          theme={theme || inputColor}
        >
          {error || ""}
        </HelperText>
      )}
    </ThemedView>
  );
};

export const UniversalTextInput = memo(UniversalTextInputComponent);
