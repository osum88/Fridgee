import { Stack } from "expo-router";
import i18n from "@/constants/translations";
import { responsiveFont } from "@/utils/scale";

export default function Friends() {
  return (
    <Stack screenOptions={{ 
      headerTitleAlign: "center", 
      headerTitleStyle: {
          fontSize: Math.round(responsiveFont(19)),
        } 
      }}>
      <Stack.Screen name="searchFriends" options={{ headerShown: false }} />
      <Stack.Screen name="profile/[id]" options={{ title: "", headerShown: true }} />
      <Stack.Screen name="(friendsTabs)" options={{ title: i18n.t("friends"), headerShown: true, headerShadowVisible: false }} />
    </Stack>
  );
}
