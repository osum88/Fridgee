import { Image } from "expo-image";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { HelloWave } from "@/components/HelloWave";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedText } from "@/components/themed/ThemedText";
import { ThemedView } from "@/components/themed/ThemedView";
import i18n from "@/constants/translations";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

export default function HomeScreen() {
  const { user, userId, signOut, canFetchUser } = useUser();

  // console.log (user)
  // console.log (userId)
  // console.log (user && user.username)

  //   const GetUserButton = () => {
  //   // Z useQuery získáme data, stav, a hlavně funkci "refetch".
  //   // Funkce "refetch" se použije k manuálnímu spuštění dotazu.
  //   const { data, isLoading, isError, error, refetch } = useUserQuery(userId, canFetchUser);

  //   const handlePress = async () => {
  //     // Spustíme dotaz manuálně a počkáme na výsledek
  //     const queryResult = await refetch();

  //     // Vypíšeme výsledek do konzole
  //     console.log("Výsledek dotazu po stisknutí tlačítka:", queryResult.data.data);

  //     // Zpracování chyby po spuštění
  //     if (queryResult.isError) {
  //       console.error("Došlo k chybě při načítání uživatele:", queryResult.error);
  //     }
  //   };

  //   return (
  //     <ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       {/* Tlačítko pro manuální spuštění dotazu */}
  //       <Pressable
  //         onPress={handlePress}
  //         disabled={isLoading}
  //         style={{
  //           backgroundColor: isLoading ? "#ccc" : "#007bff",
  //           paddingVertical: 12,
  //           paddingHorizontal: 24,
  //           borderRadius: 8
  //         }}
  //       >
  //         <ThemedText style={{ color: "white", fontWeight: "bold" }}>
  //           {isLoading ? <ActivityIndicator color="#fff" /> : "Získat uživatele"}
  //         </ThemedText>
  //       </Pressable>

  //       {/* Zde můžete zobrazit načtená data nebo chyby, pokud by to bylo potřeba */}
  //       {data && (
  //         <ThemedView style={{ marginTop: 20, padding: 10, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 }}>
  //           <ThemedText style={{ fontWeight: "bold" }}>Uživatel načten:</ThemedText>
  //           <ThemedText>Jméno: {data.data.username}</ThemedText>
  //           <ThemedText>Email: {data.data.email}</ThemedText>
  //         </ThemedView>
  //       )}

  //       {isError && (
  //         <ThemedText style={{ marginTop: 20, color: "red" }}>
  //           Chyba: {error.message}
  //         </ThemedText>
  //       )}
  //     </ThemedView>
  //   );
  // };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Welgc </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>


        
        {/* <ThemedText>{user.username}</ThemedText> */}

        <Link href="../login">
          <ThemedText type="subtitle">Login</ThemedText>
        </Link>
        <Link href="../changeLanguage">
          <ThemedText type="subtitle">{i18n.t("language")} </ThemedText>
        </Link>
        <Link href="../changeTheme">
          <ThemedText type="subtitle">{i18n.t("theme")} </ThemedText>
        </Link>

        <Link style={[{paddingVertical: 10}]} href="../searchFriends" asChild>
          <ThemedText >{i18n.t("search")}</ThemedText>
        </Link>

        <Pressable onPress={() => signOut()}>
          <ThemedText>Log out</ThemedText>
        </Pressable>

        {/* <GetUserButton></GetUserButton> */}
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText></ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
        <ThemedText>{i18n.t("errorPasswordTooWeak")}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
