import { Stack } from "expo-router";

export default function ProtectedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(setting)" options={{ headerShown: false }} />
      <Stack.Screen name="(friends)" options={{ headerShown: false }} />
    </Stack>
  );
}
