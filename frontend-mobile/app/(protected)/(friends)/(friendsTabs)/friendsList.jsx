import React, { useMemo, useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Search } from "@/components/common/Search";
import i18n from "@/constants/translations";
import { useAllFriendsApiQuery } from "@/hooks/friends/useFriendQuery";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import debounce from "lodash.debounce";
import { ThemedText } from "@/components/themed/ThemedText";
import { Skeleton } from "@/components/animated/Skeleton";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/hooks/useUser";
import useFriendManager from "@/hooks/friends/useFriendManager";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useTheme } from "@/contexts/ThemeContext";
import { DeleteFriendAlert } from "@/components/friends/DeleteFriendAlert";

//zabrani zbytecnemu renderu itemu flatlistu pokud se nezmeni props
const FriendItem = React.memo(
  ({
    item,
    errorMap,
    setErrorMap,
    debouncedUsername,
    friendshipManager,
    friendInfo,
    profilePlaceHolder,
    setSelectedFriend,
    setVisible,
  }) => {
    //useMemo zabrani aby se uri objekt vytvarel pokaznem renderu
    const imageSource = useMemo(() => {
      return errorMap[item.id]
        ? profilePlaceHolder
        : { uri: `https://picsum.photos/id/${item.id}/200/300` };
    }, [errorMap, item.id, profilePlaceHolder]);

    const onErrorImage = useCallback(() => {
      setErrorMap((prev) => ({ ...prev, [item.id]: true }));
    }, [item.id, setErrorMap]);

    //usecallback - memoizovana funkce, nemeni se mezi rendery dokud se nezmeni zavislosti, jinak by vznikali nove reference a React.memo by si myslel ze se zmenily props
    const onPressItem = useCallback(() => {
      router.push({
        pathname: `/profile/${item.id}`,
        params: {
          user: JSON.stringify({
            friendId: friendInfo(item, "id"),
            name: friendInfo(item, "name"),
            surname: friendInfo(item, "surname"),
            username: friendInfo(item, "username"),
            profilePictureUrl: friendInfo(item, "profilePictureUrl"),
            friendshipId: item.id,
            receiverId: item.receiverId,
            senderId: item.senderId,
            status: item.status,
          }),
        },
      });
    }, [item, friendInfo]);

    const onAction = useCallback(() => {
      setSelectedFriend({
        ...item,
        imageSource,
      });
      setVisible(true);
    }, [item, setSelectedFriend, imageSource, setVisible]);

    return (
      <Pressable onPress={onPressItem}>
        <ThemedView style={styles.itemContainer}>
          <ThemedView style={styles.userItem}>
            <Image
              source={imageSource}
              onError={onErrorImage}
              style={styles.profileImage}
            />
            <ThemedView style={styles.textContainer}>
              <ThemedText
                style={styles.username}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {friendInfo(item, "username")}
              </ThemedText>

              {friendInfo(item, "name") && friendInfo(item, "surname") && (
                <ThemedText
                  type="fullName"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.fullName}
                >
                  {friendInfo(item, "name")} {friendInfo(item, "surname")}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>
          <FriendActionButton status={item.status} onPress={onAction} />
        </ThemedView>
      </Pressable>
    );
  }
);

FriendItem.displayName = "FriendItem";

export default function FriendsList() {
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();

  const [debouncedUsername, setDebouncedUsername] = useState("");
  const profilePlaceHolder = useProfilePlaceHolder();
  const [errorMap, setErrorMap] = useState({});
  const insets = useSafeAreaInsets();
  const { userId } = useUser();
  const limit = Math.ceil(height / 100);
  const { colorScheme } = useTheme();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [visible, setVisible] = useState(false);
  const [profileError, setProfileError] = useState(false);

  const {
    data: users,
    isLoading,
    isFetching,
  } = useAllFriendsApiQuery(debouncedUsername);

  const { friendshipManager } = useFriendManager();

  const isInitialLoading = isLoading && !users; //data z api
  const isRefetching = isFetching && !!users; //data z cache

  const showSkeleton =
    (isInitialLoading || isRefetching) && username.length > 0;

  //vytvari zpozdeni aby se api neposilalo po kazdem znaku
  const debounceSetUsername = useMemo(
    () =>
      debounce((value) => {
        setDebouncedUsername(value);
      }, 500),
    []
  );

  //nastavi username pri psani
  const handleChange = (text) => {
    setUsername(text);
    debounceSetUsername(text);
  };

  //nastavi username pri vyhledani enterem
  const handleOnSubmitEditing = () => {
    setDebouncedUsername(username);
  };

  const friendInfo = useCallback(
    (friendship, type) => {
      if (!friendship) return null;
      if (friendship.sender?.id === userId) {
        return friendship.receiver?.[type] ?? null;
      }
      if (friendship.receiver?.id === userId) {
        return friendship.sender?.[type] ?? null;
      }
      return null;
    },
    [userId]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      {colorScheme === "light" && <ThemedLine style={styles.line} />}

      <ThemedView style={styles.searchContainer}>
        <Search
          placeholder={i18n.t("searchFriends")}
          value={username}
          onChangeText={handleChange}
          onSubmitEditing={handleOnSubmitEditing}
          style={[styles.search]}
        />
      </ThemedView>

      {selectedFriend && (
        <DeleteFriendAlert
          visible={visible}
          setVisible={setVisible}
          imageSource={selectedFriend?.imageSource}
          username={friendInfo(selectedFriend, "username")}
          setProfileError={setProfileError}
          onPress={() => {
            friendshipManager(
              friendInfo(selectedFriend, "id"),
              debouncedUsername,
              null,
              selectedFriend?.status,
              selectedFriend?.senderId,
              selectedFriend?.receiverId,
              "allFriends"
            );
          }}
        />
      )}

      {showSkeleton ? (
        <ThemedView style={{ paddingHorizontal: 8 }}>
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </ThemedView>
      ) : (
        <FlatList
          data={users?.data || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <FriendItem
              item={item}
              errorMap={errorMap}
              setErrorMap={setErrorMap}
              debouncedUsername={debouncedUsername}
              friendshipManager={friendshipManager}
              friendInfo={friendInfo}
              profilePlaceHolder={profilePlaceHolder}
              setSelectedFriend={setSelectedFriend}
              setVisible={setVisible}
            />
          )}
          ListEmptyComponent={() => {
            if (
              !isLoading &&
              !isFetching &&
              users?.data?.length === 0 &&
              username.length > 0
            ) {
              return (
                <ThemedView style={{ padding: 16, alignItems: "center" }}>
                  <ThemedText>{i18n.t("noFriendsFound")}</ThemedText>
                </ThemedView>
              );
            }
            return null;
          }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 10,
            paddingBottom: insets.bottom,
          }}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    fontSize: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginEnd: 14,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  username: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
    flexShrink: 1,
  },
  fullName: {
    flexShrink: 1,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  line: {
    width: "100%",
    height: 0.6,
  },
});
