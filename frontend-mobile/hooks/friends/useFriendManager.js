import { useUser } from "@/hooks/useUser";
import useFriendMutation from "@/hooks/friends/useFriendMutation";
import { useDebouncedMutation } from "@/hooks/useDebouncedMutation";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateQueries } from "@/utils/invalidateQueries";

const useFriendManager = () => {
  const { userId } = useUser();
  const queryClient = useQueryClient();

  const updateCacheOptimistic = ({
    user2Id,
    username,
    limit,
    cache,
    status = "",
    friendData = {},
  }) => {
    const key = limit == null ? [cache, username] : [cache, username, limit];

    const previousUsers = queryClient.getQueryData(key);
    if (!previousUsers) return;

    const updatedUsers = previousUsers.data
      .map((user) => {
        // friend search
        if (user.id === user2Id) {
          return status
            ? {
                ...user,
                friendships: { receiverId: user.id, senderId: userId, status },
              }
            : { ...user, friendships: null };
        }
        return user;
      })
      .filter((user) => {
        // friend list a requesty
        return user.senderId !== user2Id && user.receiverId !== user2Id;
      });

    queryClient.setQueryData(key, {
      ...previousUsers,
      data: updatedUsers,
    });

    if (cache !== "searchUsername") {
      queryClient.invalidateQueries({ queryKey: ["searchUsername"] });
    }
    if (cache !== "allFriends" && cache !== "receivedFriendRequests") {
      queryClient.invalidateQueries({ queryKey: ["allFriends"] });
    }
    if (cache !== "receivedFriendRequests") {
      queryClient.invalidateQueries({ queryKey: ["receivedFriendRequests"] });
    }

    // //optimisticky update cache pri pridani pritele
    // if (cache === "receivedFriendRequests") {
    //   const friendsKey = ["allFriends", username];

    //   const previousFriends = queryClient.getQueryData(friendsKey);

    //   const newFriend = {
    //     id: Date.now(),
    //     senderId: userId,
    //     receiverId: user2Id,
    //     sender: { id: userId },
    //     receiver: { id: user2Id, username: friendData?.username, name: friendData?.name, surname: friendData?.surname },
    //     status: "ACCEPTED",
    //     createdAt: new Date().toISOString(),
    //     updatedAt: new Date().toISOString(),
    //   };

    //   if (previousFriends?.data) {
    //     queryClient.setQueryData(friendsKey, {
    //       ...previousFriends,
    //       data: [newFriend, ...previousFriends.data],
    //     });
    //   } else {
    //     // pokud jeste zadna quary neexistuje vytvori se
    //     queryClient.setQueryData(friendsKey, { data: [newFriend] });
    //   }
    // }

    return previousUsers;
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
      const previousUsers = updateCacheOptimistic({ user2Id, username, limit, cache, status: "PENDING", friendData });
      debouncedMutate(addFriendMutation, `${user2Id}`, { user2Id, username, limit, cache, previousUsers});

    } else if (status?.toLowerCase() === "pending") {
      if (userId === senderId) {
        const previousUsers = updateCacheOptimistic({ user2Id, username, limit, cache, friendData });
        debouncedMutate(cancelFriendRequestMutation, `${user2Id}`, { user2Id, username, limit, cache, previousUsers});

      } else if (userId === receiverId) {
        const previousUsers = updateCacheOptimistic({ user2Id, username, limit, cache, status: "ACCEPTED", friendData, previousUsers});
        acceptFriendRequestMutation.mutate({ user2Id, username, limit, cache});
      }
    } else if (status.toLowerCase() === "accepted") {
      const previousUsers = updateCacheOptimistic({ user2Id, username, limit, cache, friendData, previousUsers });
      deleteFriendMutation.mutate({ user2Id, username, limit, cache });
    }
  };

  const respondToFriendRequest = async (user2Id, status, receiverId, action, invalidateAll = false,  username = null, friendData = {}, cache = "receivedFriendRequests", limit = null, ) => {
    if (status?.toLowerCase() === "pending" && userId === receiverId) {
      let previousUsers
      if (!invalidateAll) {
        previousUsers = updateCacheOptimistic({ user2Id, username, limit, cache, friendData });
      }
    
      if (action === "accept") {
        try {
          await acceptFriendRequestMutation.mutateAsync({ user2Id, username, limit, cache, previousUsers });
          invalidateQueries(queryClient, ["allFriends"]);
        } catch (error) {
          throw error
        }
      } else if (action === "refuse") {
        try {
          await deleteFriendMutation.mutateAsync({ user2Id, username, limit, cache, previousUsers });

        } catch (error) {
           throw error
        }
      }
      if (invalidateAll) {
        invalidateQueries(queryClient, ["searchUsername", "allFriends", "receivedFriendRequests",]);
      }
    }
  };

  return { friendshipManager, respondToFriendRequest };
};

export default useFriendManager;
