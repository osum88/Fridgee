import { Stack } from "expo-router";

export default function SearchFriends() {
  return (
    <Stack screenOptions={{ headerTitleAlign: "center" }}>
      <Stack.Screen name="searchFriends" options={{ headerShown: false }} />
    </Stack>
  );
}
