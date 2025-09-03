import { Stack } from "expo-router";

export default function Friends() {
  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="searchFriends" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ title: "", headerShown: true }} />
      <Stack.Screen name="(friendsTabs)" options={{ title: "Friends", headerShown: true, headerShadowVisible: false }} />
    </Stack>
  );
}
