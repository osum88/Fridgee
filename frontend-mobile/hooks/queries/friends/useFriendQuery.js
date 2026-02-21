import { useQuery } from "@tanstack/react-query";
import { getAllFriendsApi, getReceivedFriendRequestsApi } from "@/api/friend";

// ziska seznam vsech pratel
export const useAllFriendsApiQuery = (username) => {
  //   console.log("All Friends new fetch");
  return useQuery({
    queryKey: ["allFriends", username],
    queryFn: () => getAllFriendsApi(username),
    staleTime: 1000 * 60 * 2,
  });
};

// ziska seznam vsech prijatych zadosti o pratelstvi
export const useReceivedFriendRequestsQuery = (username) => {
  //   console.log("Received Friend Requests new fetch");
  return useQuery({
    queryKey: ["receivedFriendRequests", username],
    queryFn: () => getReceivedFriendRequestsApi(username),
    staleTime: 1000 * 60 * 2,
  });
};
