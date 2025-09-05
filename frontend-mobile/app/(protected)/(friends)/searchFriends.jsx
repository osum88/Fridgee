import React, { useMemo, useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Search } from "@/components/common/Search";
import i18n from "@/constants/translations";
import { useSearchUsersQuery } from "@/hooks/user/useUserQuery";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import debounce from "lodash.debounce";
import { ThemedText } from "@/components/themed/ThemedText";
import { Skeleton } from "@/components/animated/Skeleton";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/hooks/useUser";
import useFriendManager from "@/hooks/friends/useFriendManager";

const FriendItem = React.memo(
  ({
    item,
    profilePlaceHolder,
    errorMap,
    setErrorMap,
    debouncedUsername,
    limit,
    userId,
    friendshipManager,
  }) => {
    const onPressItem = useCallback(() => {
      router.push({
        pathname: `/profile/${item.id}`,
        params: {
          user: JSON.stringify({
            friendId: item.id,
            name: item.name,
            surname: item.surname,
            username: item.username,
            profilePictureUrl: item.profilePictureUrl,
            friendshipId: item.friendships?.id,
            receiverId: item.friendships?.receiverId,
            senderId: item.friendships?.senderId,
            status: item.friendships?.status,
          }),
        },
      });
    }, [item]);

    const imageSource = useMemo(() => {
      return errorMap[item.id]
        ? profilePlaceHolder
        : { uri: `https://picsum.photos/id/${item.id}/200/300` };
    }, [errorMap, item.id, profilePlaceHolder]);

    const onErrorImage = useCallback(() => {
      setErrorMap((prev) => ({ ...prev, [item.id]: true }));
    }, [item.id, setErrorMap]);

    const onPressAction = useCallback(() => {
      friendshipManager(
        item.id,
        debouncedUsername,
        limit,
        item.friendships?.status,
        item.friendships?.senderId,
        item.friendships?.receiverId
      );
    }, [
      item.id,
      debouncedUsername,
      limit,
      item.friendships?.status,
      item.friendships?.senderId,
      item.friendships?.receiverId,
      friendshipManager,
    ]);

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
                {item.username}
              </ThemedText>
              {item.name && item.surname && (
                <ThemedText
                  type="fullName"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={styles.fullName}
                >
                  {item.name} {item.surname}
                </ThemedText>
              )}
            </ThemedView>
          </ThemedView>

          <FriendActionButton
            status={item.friendships?.status}
            isRequestSend={userId === item.friendships?.senderId}
            onPress={onPressAction}
          />
        </ThemedView>
      </Pressable>
    );
  }
);

FriendItem.displayName = "FriendItem";

export default function SearchFriends() {
  const currentColors = useThemeColor();
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();
  const [limit, setLimit] = useState(Math.ceil(height / 100));
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const profilePlaceHolder = useProfilePlaceHolder();
  const [errorMap, setErrorMap] = useState({});
  const insets = useSafeAreaInsets();
  const { userId } = useUser();

  const {
    data: users,
    isLoading,
    isFetching,
  } = useSearchUsersQuery(debouncedUsername, limit);

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
  const handleChange = useCallback(
    (text) => {
      setUsername(text);
      if (limit === 40) {
        setLimit(Math.ceil(height / 100));
      }
      debounceSetUsername(text);
    },
    [limit, height, debounceSetUsername]
  );

  //nastavi username pri vyhledani enterem
  const handleOnSubmitEditing = useCallback(() => {
    setLimit(40);
    setDebouncedUsername(username);
  }, [username]);

  return (
    <ThemedView safe={true} style={{ flex: 1 }}>
      <ThemedView style={styles.contentWrapper}>
        <ThemedView style={styles.searchContainer}>
          <TouchableOpacity
            style={{ paddingHorizontal: 3 }}
            onPress={() => router.back()}
          >
            <IconSymbol
              size={30}
              name="chevron.left"
              color={currentColors.text}
            />
          </TouchableOpacity>

          <Search
            placeholder={i18n.t("searchUsername")}
            value={username}
            onChangeText={handleChange}
            onSubmitEditing={handleOnSubmitEditing}
            transparent={true}
            style={[styles.search]}
          />
        </ThemedView>

        <ThemedLine style={styles.line} />

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
                profilePlaceHolder={profilePlaceHolder}
                errorMap={errorMap}
                setErrorMap={setErrorMap}
                debouncedUsername={debouncedUsername}
                limit={limit}
                userId={userId}
                friendshipManager={friendshipManager}
              />
            )}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            ListEmptyComponent={() => {
              if (
                !isLoading &&
                !isFetching &&
                users?.data?.length === 0 &&
                username.length > 0
              ) {
                return (
                  <ThemedView style={{ padding: 16, alignItems: "center" }}>
                    <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
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
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flexGrow: 1,
    paddingTop: 14,
  },
  searchContainer: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
    fontSize: 16,
  },
  line: {
    width: "100%",
    height: 0.6,
    marginVertical: 10,
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
});
