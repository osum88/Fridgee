import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { StyleSheet } from "react-native";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import useFriendManager from "@/hooks/friends/useFriendManager";
import { useState } from "react";

export default function FriendProfile() {
  const params = useLocalSearchParams();

  const [userData, setUserData] = useState(JSON.parse(params.user));
  const { userId } = useUser();
  const [request, setRequest] = useState(
    !!(
      userData.friendships?.status === "PENDING" &&
      userId === userData.friendships?.receiverId
    )
  );

  console.log(userData);
  // --------------------------------------------------------------
  // ------------                TODO                --------------
  // --------------------------------------------------------------
  const { respondToFriendRequest } = useFriendManager();

  const handleAccept = () => {
    respondToFriendRequest(
      userData.id,
      userData.friendships?.status,
      userData.friendships?.receiverId,
      "accept"
    );
    setRequest(false);
    setUserData((prev) => ({
      ...prev,
      friendships: {
        ...prev.friendships,
        status: "ACCEPTED",
      },
    }));
  };

  const handleRefuse = () => {
    respondToFriendRequest(
      userData.id,
      userData.friendships?.status,
      userData.friendships?.receiverId,
      "refuse"
    );
    setRequest(false);
    setUserData((prev) => ({
      ...prev,
      friendships: null,
    }));
  };

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
        Profil uživatele
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>ID: {userData.id}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>name: {userData.name}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        surname: {userData.surname}
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        username: {userData.username}
      </ThemedText>

      {userData.friendships ? (
        <ThemedText style={{ marginTop: 10 }}>
          friendship: {userData.friendships?.status}
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
