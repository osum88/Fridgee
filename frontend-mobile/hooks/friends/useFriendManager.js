import { useUser } from "@/hooks/useUser";
import useFriendMutation from "@/hooks/friends/useFriendMutation";
import { useDebouncedMutation } from "@/hooks/useDebouncedMutation";
import { useQueryClient } from "@tanstack/react-query";

const useFriendManager = () => {
  const { userId } = useUser();
  const queryClient = useQueryClient();

  const updateCacheOptimistic = ({
    user2Id,
    username,
    limit,
    cache,
    status = "",
    friendData = {}
  }) => {
    const key = limit == null ? [cache, username] : [cache, username, limit];

    const previousUsers = queryClient.getQueryData(key);
    if (!previousUsers) return;

    const updatedUsers = previousUsers.data.map((user) => {
      if (user.id === user2Id) {
        return status
          ? {
              ...user,
              friendships: { receiverId: user.id, senderId: userId, status },
            }
          : { ...user, friendships: null };
      }
      return user;
    });

    queryClient.setQueryData(key, {
      ...previousUsers,
      data: updatedUsers,
    });

    // //vytvori pole quary klicu
    // const allCaches = [
    //   "searchUsername",
    //   "allFriends",
    //   "receivedFriendRequests",
    // ];
    // const keysToInvalidate = allCaches
    //   .filter((c) => c !== cache)
    //   .map((c) => [c]);

    // // invalidace
    // Promise.all(
    //   keysToInvalidate.map((qKey) =>
    //     queryClient.invalidateQueries({ queryKey: qKey })
    //   )
    // );

    if (cache !== "searchUsername") {
      queryClient.invalidateQueries({ queryKey: ["searchUsername"] });
    }
    if (cache !== "allFriends" && cache !== "receivedFriendRequests") {
      queryClient.invalidateQueries({ queryKey: ["allFriends"] });
    }
    if (cache !== "receivedFriendRequests") {
      queryClient.invalidateQueries({ queryKey: ["receivedFriendRequests"] });
    }

    //optimisticky update cache pri pridani pritele
    if (cache !== "allFriends") {
      const friendsKey = ["allFriends", username];

      const previousFriends = queryClient.getQueryData(friendsKey);

      const newFriend = {
        id: Date.now(), 
        senderId: userId,
        receiverId: user2Id,
        sender: { id: userId },
        receiver: { id: user2Id, username: friendData?.username, name: friendData?.name, surname: friendData?.surname },
        status: "ACCEPTED",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (previousFriends?.data) {
        queryClient.setQueryData(friendsKey, {
          ...previousFriends,
          data: [newFriend, ...previousFriends.data],
        });
      } else {
        // pokud jeste zadna quary neexistuje vytvori se
        queryClient.setQueryData(friendsKey, { data: [newFriend] });
      }
    }
  };

  const {
    addFriendMutation,
    cancelFriendRequestMutation,
    deleteFriendMutation,
    acceptFriendRequestMutation,
  } = useFriendMutation();
  const debouncedMutate = useDebouncedMutation();

    const friendshipManager = (user2Id, username, limit, status, senderId, receiverId, cache = "searchUsername", friendData = {}) => {
    if (!status) {
      updateCacheOptimistic({ user2Id, username, limit, cache, status: "PENDING", friendData });
      debouncedMutate(addFriendMutation, `${user2Id}`, { user2Id, username, limit, cache});
    } else if (status?.toLowerCase() === "pending") {
      if (userId === senderId) {
        updateCacheOptimistic({ user2Id, username, limit, cache, friendData });
        debouncedMutate(cancelFriendRequestMutation, `${user2Id}`, { user2Id, username, limit, cache});
      } else if (userId === receiverId) {
        updateCacheOptimistic({ user2Id, username, limit, cache, status: "ACCEPTED", friendData});
        acceptFriendRequestMutation.mutate({ user2Id, username, limit, cache});
      }
    } else if (status.toLowerCase() === "accepted") {
      updateCacheOptimistic({ user2Id, username, limit, cache, friendData });
      deleteFriendMutation.mutate({ user2Id, username, limit, cache });
    }
  };

  const respondToFriendRequest = (user2Id, status, receiverId, action, username = null, limit = null, cache = "searchUsername") => {
    if (status?.toLowerCase() === "pending" && userId === receiverId) {
      if (action === "accept") {
        updateCacheOptimistic({ user2Id, username, limit, cache });
        acceptFriendRequestMutation.mutate({ user2Id, username, limit, cache });
      } else if (action === "refuse") {
        updateCacheOptimistic({ user2Id, username, limit, cache });
        deleteFriendMutation.mutate({ user2Id, username, limit, cache });
      }
    }
  };

  return { friendshipManager, respondToFriendRequest };
};

export default useFriendManager;
