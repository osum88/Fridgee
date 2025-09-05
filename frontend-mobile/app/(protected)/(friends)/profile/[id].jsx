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
    !!(userData?.status === "PENDING" && userId === userData?.receiverId)
  );

  // --------------------------------------------------------------
  // ------------                TODO                --------------
  // --------------------------------------------------------------
  const { respondToFriendRequest } = useFriendManager();

  const handleAccept = async () => {
    try {
      await respondToFriendRequest(
        userData?.friendId,
        userData?.status,
        userData?.receiverId,
        "accept",
        true
      );
      setRequest(false);
      setUserData((prev) => ({
        ...prev,
        status: "ACCEPTED",
      }));
    } catch (error) {
      console.error("Failed to accept friend request:", error);
    }
  };

  const handleRefuse = async () => {
    try {
      await respondToFriendRequest(
        userData?.friendId,
        userData?.status,
        userData?.receiverId,
        "refuse",
        true
      );

      setRequest(false);
      setUserData((prev) => ({
        ...prev,
        status: "NONE",
      }));
    } catch (error) {
      console.error("Failed to refuse friend request:", error);
    }
  };

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText style={{ fontSize: 24, fontWeight: "bold" }}>
        Profil uživatele
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        ID: {userData?.friendId}
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>name: {userData?.name}</ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        surname: {userData?.surname}
      </ThemedText>
      <ThemedText style={{ marginTop: 10 }}>
        username: {userData?.username}
      </ThemedText>

      {userData?.status ? (
        <ThemedText style={{ marginTop: 10 }}>
          friendship: {userData?.status}
        </ThemedText>
      ) : (
        <ThemedText style={{ marginTop: 10 }}>friendship: none</ThemedText>
      )}

      {request && (
        <ThemedView style={styles.request}>
          <FriendActionButton
            style={styles.btn}
            textButton="accept"
            onPress={() => handleAccept()}
          />
          <FriendActionButton
            style={styles.btn}
            textButton="decline"
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
