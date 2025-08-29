import { useCallback, useEffect, useMemo, useState } from "react";
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
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";
import { ThemedLine } from "@/components/themed/ThemedLine";
import { Search } from "@/components/common/Search";
import i18n from "@/constants/translations";
import { useSearchUsersQuery } from "@/hooks/user/useUserQuery";
import debounce from "lodash.debounce";
import { ThemedText } from "@/components/themed/ThemedText";

export default function SearchFriends() {
  const colorScheme = useColorScheme();
  const currentColors = Colors[colorScheme ?? "light"];
  const [username, setUsername] = useState("");
  const { height } = useWindowDimensions();
  const [limit, setLimit] = useState(Math.ceil(height / 100));
  const [debouncedUsername, setDebouncedUsername] = useState("");

  const { data: users, isLoading } = useSearchUsersQuery(
    debouncedUsername,
    limit
  );

  useEffect(() => {
    console.log(users);
    console.log(limit);
    console.log(debouncedUsername);
  }, [users]);

  const debounceSetUsername = useMemo(
    () =>
      debounce((value) => {
        setDebouncedUsername(value);
      }, 400),
    []
  );

  const handleChange = (text) => {
    setUsername(text);
    if (limit === 30) {
      setLimit(Math.ceil(height / 100));
    }
    debounceSetUsername(text);
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
            onSubmitEditing={() => setLimit(30)}
            transparent={true}
            style={[styles.search]}
          />
        </ThemedView>

        <ThemedLine style={styles.line} />

        <FlatList
          data={(users && users.data) || []}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <ThemedView style={styles.userItem}>
              <Image
                source={{
                  uri: `https://picsum.photos/id/${item.id}/200/300`,
                }}
                style={styles.profileImage}
              />
              <ThemedView style={styles.textContainer}>
                <ThemedText style={styles.username}>{item.username}</ThemedText>
                {item.name && item.surname && (
                  <ThemedText type="fullName">
                    {item.name} {item.surname}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}
          ListEmptyComponent={
            !isLoading &&
            username && (
              <ThemedView style={{ padding: 16, alignItems: "center" }}>
                <ThemedText>{i18n.t("noUsersFound")}</ThemedText>
              </ThemedView>
            )
          }
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10 }}
        />
      </ThemedView>
      <ThemedLine />
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
    marginEnd: 12,
  },
  userItem: {
    flexDirection: "row",
    width: "100%",

    padding: 12,
    // borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor: "#ccc",
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
