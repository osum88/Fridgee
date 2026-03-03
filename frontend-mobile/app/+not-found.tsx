import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import { useUser } from "@/hooks/useUser";
import i18n from "@/constants/translations";

export default function NotFoundScreen() {
  const { isAuthenticated } = useUser();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">{i18n.t("screenNotFound")}</ThemedText>
        {isAuthenticated ? (
          <Link href="/" style={styles.link}>
            <ThemedText type="link">{i18n.t("goHome")}</ThemedText>
          </Link>
        ) : (
          <Link href="/login" style={styles.link}>
            <ThemedText type="link">{i18n.t("goLogin")}</ThemedText>
          </Link>
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
