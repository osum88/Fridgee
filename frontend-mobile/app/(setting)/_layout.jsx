import { Stack } from "expo-router";

export default function SettingLayout() {
  return (
    <Stack>
      <Stack.Screen name="changeLanguage" options={{ title: "Change language" }} />
      
    </Stack>
  );
}