import { useUser } from "@/hooks/useUser";
import useFriendMutation from "@/hooks/friends/useFriendMutation";

const useFriendshipManager = () => {
  const { userId } = useUser();

  const {
    addFriendMutation,
    cancelFriendRequestMutation,
    deleteFriendMutation,
    acceptFriendRequestMutation,
  } = useFriendMutation();

  const friendshipManager = (user2Id, username, limit, status, senderId, receiverId) => {
    if (!status) {
      addFriendMutation.mutate({ user2Id, username, limit }); 
    } else if (status?.toLowerCase() === "pending") {
      if (userId === senderId) {
        cancelFriendRequestMutation.mutate({ user2Id, username, limit, });
      } else if (userId === receiverId) {
        acceptFriendRequestMutation.mutate({ user2Id, username, limit, });
      }
    } else if (status.toLowerCase() === "accepted") {
      deleteFriendMutation.mutate({ user2Id, username, limit, });
    }
  };

  const respondToFriendRequest = (user2Id, username, limit, status, receiverId, action) => {
  if (status?.toLowerCase() === "pending" && userId === receiverId) {
    if (action === "accept") {
      acceptFriendRequestMutation.mutate({ user2Id, username, limit });
    } else if (action === "refuse") {
      deleteFriendMutation.mutate({ user2Id, username, limit });
    }
  }
};

  return { friendshipManager, respondToFriendRequest };
};

export default useFriendshipManager;
