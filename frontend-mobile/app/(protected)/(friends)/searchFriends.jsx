import React, { useMemo, useState, useCallback } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/icons/IconSymbol";
import {
  FlatList,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Search } from "@/components/input/Search";
import i18n from "@/constants/translations";
import { useSearchUsersQuery } from "@/hooks/queries/user/useUserQuery";
import { useProfilePlaceHolder } from "@/hooks/image/useProfilePlaceHolder";
import debounce from "lodash.debounce";
import { ThemedText } from "@/components/themed/ThemedText";
import { Skeleton } from "@/components/animated/Skeleton";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import { useThemeColor } from "@/hooks/colors/useThemeColor";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUser } from "@/hooks/useUser";
import useFriendManager from "@/hooks/friends/useFriendManager";
import {
  responsiveFont,
  responsiveSize,
  responsiveVertical,
  responsivePadding,
} from "@/utils/scale";
import { IMAGEKIT_URL_ENDPOINT } from "@/config/config";
import { ImageViewer } from "../../../components/image/ImageViewer";
import { DeleteAlert } from "@/components/modals/DeleteAlert";

const FriendItem = React.memo(
  ({
    item,
    debouncedUsername,
    limit,
    userId,
    friendshipManager,
    setSelectedFriend,
    setVisible,
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

    const onPressAction = useCallback(() => {
      if (item.friendships?.status === "ACCEPTED") {
        setSelectedFriend({
          ...item,
        });
        setVisible(true);
      } else {
        friendshipManager(
          item.id,
          debouncedUsername,
          limit,
          item.friendships?.status,
          item.friendships?.senderId,
          item.friendships?.receiverId,
        );
      }
    }, [item, debouncedUsername, limit, friendshipManager, setSelectedFriend, setVisible]);

    return (
      <Pressable onPress={onPressItem}>
        <ThemedView style={styles.itemContainer}>
          <ThemedView style={styles.userItem}>
            <ImageViewer
              imageUrl={`${IMAGEKIT_URL_ENDPOINT}/users/${item.id}/profile/profile_${item.id}_150x150.webp`}
              isLoading={false}
              isImagePlaceholder={true}
              imageStyle={styles.profileImage}
            />

            <ThemedView style={styles.textContainer}>
              <ThemedText style={styles.username} numberOfLines={1} ellipsizeMode="tail">
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
  },
);

FriendItem.displayName = "FriendItem";

export default function SearchFriends() {
  const currentColors = useThemeColor();
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();
  const [limit, setLimit] = useState(Math.ceil(height / 100));
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const profilePlaceHolder = useProfilePlaceHolder();
  const insets = useSafeAreaInsets();
  const { userId } = useUser();
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [visible, setVisible] = useState(false);

  const { data: users, isLoading, isFetching } = useSearchUsersQuery(debouncedUsername, limit);

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
  const handleChange = useCallback(
    (text) => {
      setUsername(text);
      if (limit === 40) {
        setLimit(Math.ceil(height / 100));
      }
      debounceSetUsername(text);
    },
    [limit, height, debounceSetUsername],
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
            style={{ paddingLeft: responsiveSize.horizontal(3) }}
            onPress={() => router.back()}
          >
            <IconSymbol
              size={responsiveSize.moderate(24)}
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

        {selectedFriend && (
          <DeleteAlert
            visible={visible}
            setVisible={setVisible}
            description={[i18n.t("removeFromFriends1"), i18n.t("removeFromFriends2")]}
            deleteItem={selectedFriend?.username}
            confirmLabel={i18n.t("remove")}
            imageSource={`${IMAGEKIT_URL_ENDPOINT}/users/${selectedFriend.id}/profile/profile_${selectedFriend.id}_150x150.webp`}
            onConfirm={() => {
              friendshipManager(
                selectedFriend.id,
                debouncedUsername,
                limit,
                selectedFriend.friendships?.status,
                selectedFriend.friendships?.senderId,
                selectedFriend.friendships?.receiverId,
              );
            }}
          />
        )}

        {showSkeleton ? (
          <ThemedView style={{ paddingHorizontal: responsiveSize.horizontal(7) }}>
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
                debouncedUsername={debouncedUsername}
                limit={limit}
                userId={userId}
                friendshipManager={friendshipManager}
                setSelectedFriend={setSelectedFriend}
                setVisible={setVisible}
              />
            )}
            initialNumToRender={10}
            windowSize={5}
            maxToRenderPerBatch={10}
            removeClippedSubviews={true}
            ListEmptyComponent={() => {
              if (!isLoading && !isFetching && users?.data?.length === 0 && username.length > 0) {
                return (
                  <ThemedView style={styles.noUsersFound}>
                    <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
                  </ThemedView>
                );
              }
              return null;
            }}
            contentContainerStyle={{
              flexGrow: 1,
              paddingHorizontal: responsiveSize.horizontal(9),
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
    paddingTop: responsiveSize.vertical(13),
  },
  searchContainer: {
    paddingHorizontal: responsiveSize.horizontal(7),
    flexDirection: "row",
    alignItems: "center",
  },
  search: {
    flex: 1,
  },
  line: {
    width: "100%",
    height:
      responsiveSize.vertical(0.7) < 0.6 ? StyleSheet.hairlineWidth : responsiveSize.vertical(0.7),
    marginVertical: responsiveSize.vertical(9),
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
  noUsersFound: {
    ...responsivePadding(15),
    alignItems: "center",
  },
});
