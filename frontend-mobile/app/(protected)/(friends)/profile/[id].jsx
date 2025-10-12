import { ThemedView } from "@/components/themed/ThemedView";
import { ThemedText } from "@/components/themed/ThemedText";
import { useLocalSearchParams } from "expo-router";
import { useUser } from "@/hooks/useUser";
import { StyleSheet } from "react-native";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import useFriendManager from "@/hooks/friends/useFriendManager";
import { useState } from "react";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { responsiveFont, responsiveSize } from "@/utils/scale";

export default function FriendProfile() {
  const params = useLocalSearchParams();
  const [userData, setUserData] = useState(JSON.parse(params.user));
  const { userId } = useUser();
  const [request, setRequest] = useState(
    !!(userData?.status === "PENDING" && userId === userData?.receiverId)
  );
  const { respondToFriendRequest } = useFriendManager();

  const color = useThemeColor();

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
      setUserData((prev) => ({ ...prev, status: "ACCEPTED" }));
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
      setUserData((prev) => ({ ...prev, status: "NONE" }));
    } catch (error) {
      console.error("Failed to refuse friend request:", error);
    }
  };

  return (
    <ThemedView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ThemedText style={{ fontSize: responsiveFont(23), fontWeight: "bold" }}>
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
      <ThemedText style={{ marginTop: 10 }}>
        friendship: {userData?.status || "none"}
      </ThemedText>

      {request && (
        <ThemedView style={styles.request}>
          <FriendActionButton
            style={styles.btn}
            textButton="accept"
            onPress={handleAccept}
          />
          <FriendActionButton
            style={styles.btn}
            textButton="decline"
            onPress={handleRefuse}
          />
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  btn: {
    minWidth: responsiveSize.horizontal(120),
  },
  request: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(18),
    marginTop: responsiveSize.vertical(13),
  },
});
