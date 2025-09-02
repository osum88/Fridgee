import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { StyleSheet } from "react-native";
import { useThemeColor } from "@/hooks/useThemeColor";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import useFriendshipManager from "@/hooks/friends/useFriendshipManager";
import { useState } from "react";

export default function FriendProfile() {
  const params = useLocalSearchParams();
  const user = JSON.parse(params.user);

  const { userId } = useUser();
  const [request, setRequest] = useState(
    !!(
      user.friendships?.status === "pending" &&
      userId === user.friendships?.receiverId
    )
  );


  // --------------------------------------------------------------
  // ------------                TODO                --------------
  // --------------------------------------------------------------
  const { respondToFriendRequest } = useFriendshipManager();

  const handleAccept = () => {
    respondToFriendRequest(
      user.id,
      null,
      null,
      user.friendships?.status,
      user.friendships?.receiverId,
      "accept"
    );
    setRequest(false);
  };

  const handleRefuse = () => {
    respondToFriendRequest(
      user.id,
      null,
      null,
      user.friendships?.status,
      user.friendships?.receiverId,
      "refuse"
    );
    setRequest(false);
  };

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

      {user.friendships ? (
        <ThemedText style={{ marginTop: 10 }}>
          friendship: {user.friendships?.status}
        </ThemedText>
      ) : (
        <ThemedText style={{ marginTop: 10 }}>friendship: none</ThemedText>
      )}

      {request && (
        <ThemedView style={styles.request}>
          <FriendActionButton
            style={styles.btn}
            textButton="Přijmout"
            onPress={() => handleAccept()}
          />
          <FriendActionButton
            style={styles.btn}
            textButton="Odmítnout"
            onPress={() => handleRefuse()}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: 140,
  },
  request: {
    flexDirection: "row",
    gap: 18,
    marginTop: 14,
  },
});
