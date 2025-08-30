import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useLocalSearchParams } from "expo-router";

export default function FriendProfile() {
  const params = useLocalSearchParams();
  const user = JSON.parse(params.user);

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
        Profil uživatele
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>ID: {user.id}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>name: {user.name}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>surname: {user.surname}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        username: {user.username}
      </ThemedText>
    </ThemedView>
  );
}
