import { Stack } from "expo-router";
import { useEffect } from "react";
import { useGetUserQuery } from "@/hooks/user/useGetUserQuery";
import { useUser } from "@/hooks/useUser";

export default function ProtectedLayout() {
  const { setUser, userId  } = useUser();
  // const { data: userData, isError } = useGetUserQuery(userId);

  // useEffect(() => {
  //   if (userData && userData.data) {
  //     setUser(userData.data);
  //     console.log("User data saved to context.");
  //   }
  //   if(isError){
  //     console.error("Error fetching user data:", isError)
  //   }
  // }, [userData, setUser, isError]);



  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(setting)" options={{ headerShown: false }} />
    </Stack>
  );
}
