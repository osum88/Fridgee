/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = "#11aadcff";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    surface: "#F5F5F5",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
    outline: "#dadee0ff",
    error: "#df4b31ff",
    primary: "#1d9bc5ff",
    onPrimary: "#fff",
    input: "#F5F5F5",
    input_text: "#787683",
    fullName: "#9c9a9aff"
  },
  dark: {
    text: "#e0e0e0",
    background: "#121212",
    surface: "#1e1e1e",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    outline: "#535353",
    error: "#f32525ff",
    primary: "#22b2e2ff",
    onPrimary: "#11181C",
    input: "#252527",
    input_text: "#787683",
    fullName: "#9c9a9aff"
  },
};
