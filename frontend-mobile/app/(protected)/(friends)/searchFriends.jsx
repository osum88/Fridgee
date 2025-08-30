import { useMemo, useState } from "react";
import { ThemedView } from "@/components/themed/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import {
  FlatList,
  Image,
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
import { Skeleton } from "@/components/common/Skeleton";
import { useThemeColor } from "@/hooks/useThemeColor";


export default function SearchFriends() {
  const currentColors = useThemeColor();
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();
  const [limit, setLimit] = useState(Math.ceil(height / 100));
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const profilePlaceHolder = useProfilePlaceHolder();
  const [errorMap, setErrorMap] = useState({});

  const {
    data: users,
    isLoading,
    isFetching,
  } = useSearchUsersQuery(debouncedUsername, limit);

  const isInitialLoading = isLoading && !users; //data z api
  const isRefetching = isFetching && !!users; //data z cache

  const showSkeleton =
    (isInitialLoading || isRefetching) && username.length > 0;

  //vytvari zpozdeni aby se api neposilalo po kazdem znaku
  const debounceSetUsername = useMemo(
    () =>
      debounce((value) => {
        setDebouncedUsername(value);
      }, 400),
    []
  );

  //nastavi username pri psani
  const handleChange = (text) => {
    setUsername(text);
    if (limit === 30) {
      setLimit(Math.ceil(height / 100));
    }
    debounceSetUsername(text);
  };

  //nastavi username pri vyhledani enterem
  const handleOnSubmitEditing = () => {
    setLimit(30);
    setDebouncedUsername(username);
  };

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
          <ThemedView style={{ paddingHorizontal: 10 }}>
            {Array.from({ length: limit }).map((_, i) => (
              <Skeleton key={i} />
            ))}
          </ThemedView>
        ) : (
          <FlatList
            data={(users && users.data) || []}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: `/profile/${item.id}`,
                    params: { user: JSON.stringify(item) },
                  })
                }
              >
                <ThemedView style={styles.userItem}>
                  <Image
                    source={
                      errorMap[item.id]
                        ? profilePlaceHolder
                        : {
                            uri: `https://api.dicebear.com/7.x/adventurer/png?seed=${item.username}&backgroundColor=2fd300`,
                          }
                    }
                    onError={() =>
                      setErrorMap((prev) => ({ ...prev, [item.id]: true }))
                    }
                    style={styles.profileImage}
                  />
                  <ThemedView style={styles.textContainer}>
                    <ThemedText style={styles.username}>
                      {item.username}
                    </ThemedText>
                    {item.name && item.surname && (
                      <ThemedText type="fullName">
                        {item.name} {item.surname}
                      </ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>
              </TouchableOpacity>
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
                    <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
                  </ThemedView>
                );
              }
              return null;
            }}
            contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10 }}
          />
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  contentWrapper: {
    flexGrow: 1,
    paddingVertical: 14,
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
    width: 55,
    height: 55,
    borderRadius: 50,
    marginEnd: 14,
  },
  userItem: {
    flexDirection: "row",
    width: "100%",
    padding: 12,
  },

  username: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "600",
  },
  textContainer: {
    justifyContent: "center",
  },
});
