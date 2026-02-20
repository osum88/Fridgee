import React, { useCallback, useMemo, useState } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { FlatList, Image, Pressable, StyleSheet, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Search } from "@/components/input/Search";
import i18n from "@/constants/translations";
import { useReceivedFriendRequestsQuery } from "@/hooks/friends/useFriendQuery";
import { useProfilePlaceHolder } from "@/hooks/useProfilePlaceHolder";
import debounce from "lodash.debounce";
import { ThemedText } from "@/components/themed/ThemedText";
import { Skeleton } from "@/components/animated/Skeleton";
import { FriendActionButton } from "@/components/friends/FriendActionButton";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import useFriendManager from "@/hooks/friends/useFriendManager";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { useTheme } from "@/contexts/ThemeContext";
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
    respondToFriendRequest,
    debouncedUsername,
    errorMap,
    setErrorMap,
    profilePlaceHolder,
  }) => {
    //usecallback - memorizovana funkce, nemeni se mezi rendery dokud se nezmeni zavislosti, jinak by vznikali nove reference a React.memo by si myslel ze se zmenily props

    const onPressItem = useCallback(() => {
      router.push({
        pathname: `/profile/${item.id}`,
        params: {
          user: JSON.stringify({
            friendId: item.sender?.id,
            name: item.sender?.name,
            surname: item.sender?.surname,
            username: item.sender?.username,
            profilePictureUrl: item.sender?.profilePictureUrl,
            friendshipId: item.id,
            receiverId: item.receiverId,
            senderId: item.senderId,
            status: item.status,
          }),
        },
      });
    }, [item]);

    const onAccept = useCallback(() => {
      respondToFriendRequest(
        item.sender.id,
        item.status,
        item.receiverId,
        "accept",
        false,
        debouncedUsername,
        item.sender,
      );
    }, [item, debouncedUsername, respondToFriendRequest]);

    const onRefuse = useCallback(() => {
      respondToFriendRequest(
        item.sender.id,
        item.status,
        item.receiverId,
        "refuse",
        false,
        debouncedUsername,
        item.sender,
      );
    }, [item, debouncedUsername, respondToFriendRequest]);

    //useMemo zabrani aby se uri objekt vytvarel pokaznem renderu
    const imageSource = useMemo(() => {
      return errorMap[item.sender.id]
        ? profilePlaceHolder
        : {
            uri: `${IMAGEKIT_URL_ENDPOINT}/users/${item.sender.id}/profile/profile_${item.sender.id}_150x150.webp`,
          };
    }, [item, profilePlaceHolder, errorMap]);

    const onErrorImage = useCallback(() => {
      setErrorMap((prev) => ({ ...prev, [item.sender.id]: true }));
    }, [item.sender.id, setErrorMap]);

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
              <ThemedText style={styles.username} numberOfLines={2} ellipsizeMode="tail">
                <ThemedText style={[styles.username, { fontWeight: "600" }]}>
                  {item.sender?.username}
                </ThemedText>{" "}
                {i18n.t("friendRequestMessage")}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.request}>
            <FriendActionButton
              style={[styles.btn, styles.marginStart6]}
              icon="checkmark"
              onPress={onAccept}
            />
            <FriendActionButton style={styles.btn} icon="xmark" onPress={onRefuse} />
          </ThemedView>
        </ThemedView>
      </Pressable>
    );
  },
);

FriendItem.displayName = "FriendItem";

export default function FriendsRequests() {
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();

  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [errorMap, setErrorMap] = useState({});
  const insets = useSafeAreaInsets();
  const limit = Math.ceil(height / 100);
  const profilePlaceHolder = useProfilePlaceHolder();
  const { colorScheme } = useTheme();

  const { data: users, isLoading, isFetching } = useReceivedFriendRequestsQuery(debouncedUsername);

  const { respondToFriendRequest } = useFriendManager();

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
              respondToFriendRequest={respondToFriendRequest}
              debouncedUsername={debouncedUsername}
              errorMap={errorMap}
              setErrorMap={setErrorMap}
              profilePlaceHolder={profilePlaceHolder}
            />
          )}
          initialNumToRender={10}
          windowSize={5}
          maxToRenderPerBatch={10}
          removeClippedSubviews={true}
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
  line: {
    width: "100%",
    height: responsiveSize.vertical(0.7),
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
    flexShrink: 1,
  },
  textContainer: {
    justifyContent: "center",
    flex: 1,
  },
  request: {
    flexDirection: "row",
    gap: responsiveSize.horizontal(9),
  },
  btn: {
    minWidth: responsiveSize.horizontal(43),
  },
  marginStart6: {
    marginStart: 6,
  },
});
