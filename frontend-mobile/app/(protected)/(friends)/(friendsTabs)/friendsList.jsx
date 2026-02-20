import React, { useMemo, useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Search } from "@/components/input/Search";
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
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";

//zabrani zbytecnemu renderu itemu flatlistu pokud se nezmeni props
const FriendItem = React.memo(
  ({
    item,
    errorMap,
    setErrorMap,
    friendInfo,
    profilePlaceHolder,
    setSelectedFriend,
    setVisible,
  }) => {
    //useMemo zabrani aby se uri objekt vytvarel pokaznem renderu
    const imageSource = useMemo(() => {
      return errorMap[friendInfo(item, "id")]
        ? profilePlaceHolder
        : {
            uri: `${IMAGEKIT_URL_ENDPOINT}/users/${friendInfo(item, "id")}/profile/profile_${friendInfo(item, "id")}_150x150.webp`,
          };
    }, [errorMap, item, profilePlaceHolder, friendInfo]);

    const onErrorImage = useCallback(() => {
      setErrorMap((prev) => ({ ...prev, [friendInfo(item, "id")]: true }));
    }, [item, setErrorMap, friendInfo]);

    //usecallback - memorizovana funkce, nemeni se mezi rendery dokud se nezmeni zavislosti, jinak by vznikali nove reference a React.memo by si myslel ze se zmenily props
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
              defaultSource={imageSource}
              onError={onErrorImage}
              style={styles.profileImage}
            />
            <ThemedView style={styles.textContainer}>
              <ThemedText style={styles.username} numberOfLines={1} ellipsizeMode="tail">
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
  },
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

  const { data: users, isLoading, isFetching } = useAllFriendsApiQuery(debouncedUsername);

  const { friendshipManager } = useFriendManager();

  const isInitialLoading = isLoading && !users; //data z api
  const isRefetching = isFetching && !!users; //data z cache

  const showSkeleton = (isInitialLoading || isRefetching) && username.length > 0;

  //vytvari zpozdeni aby se api neposilalo po kazdem znaku
  const debounceSetUsername = useMemo(
    () =>
      debounce((value) => {
        setDebouncedUsername(value);
      }, 500),
    [],
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

  //vraci info o friend
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
    [userId],
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
          onPress={() => {
            friendshipManager(
              friendInfo(selectedFriend, "id"),
              debouncedUsername,
              null,
              selectedFriend?.status,
              selectedFriend?.senderId,
              selectedFriend?.receiverId,
              "allFriends",
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
              friendInfo={friendInfo}
              profilePlaceHolder={profilePlaceHolder}
              setSelectedFriend={setSelectedFriend}
              setVisible={setVisible}
            />
          )}
          ListEmptyComponent={() => {
            if (!isLoading && !isFetching && users?.data?.length === 0 && username.length > 0) {
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
    paddingHorizontal: responsiveSize.horizontal(5),
    paddingVertical: responsiveSize.vertical(9),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
  },
  profileImage: {
    width: responsiveSize.moderate(57),
    height: responsiveSize.moderate(57),
    borderRadius: responsiveSize.moderate(50),
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
    ...responsivePadding(7),
  },
  username: {
    fontSize: responsiveFont(15),
    lineHeight: responsiveVertical(19),
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
    height: responsiveSize.vertical(0.7),
  },
});
