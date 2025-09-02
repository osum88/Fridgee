import {
  addFriendApi,
  deleteFriendApi,
  cancelFriendRequestApi,
  acceptFriendRequestApi,
} from "@/api/friend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateQuaryExcept } from "@/utils/invalidateQuaryExcept";
import { useUser } from "@/hooks/useUser";

const useFriendMutationItem = (apiFn, status) => {
  const queryClient = useQueryClient();
  const { userId } = useUser();

  // Funkce pro optimistickou aktualizaci cache
  const updateFriendshipCache = async ({
    user2Id,
    username,
    limit,
    status = "",
  }) => {
    //zrusi probihajici dotazy s klicem
    await queryClient.cancelQueries({
      queryKey: ["searchUsername", username, limit],
    });

    //data pred zmenou
    const previousUsers = queryClient.getQueryData([
      "searchUsername",
      username,
      limit,
    ]);

    //updatuje data v cache (optimisticky update)
    queryClient.setQueryData(["searchUsername", username, limit], (oldData) => {
      if (!oldData) return oldData;
      const updatedUsers = oldData.data.map((user) => {
        if (user.id === user2Id) {
          if (status) {
            return {
              ...user,
              friendships: {
                receiverId: user.id,
                senderId: userId,
                status,
              },
            };
          } else {
            return {
              ...user,
              friendships: null,
            };
          }
        }
        return user;
      });
      return { ...oldData, data: updatedUsers };
    });
    return { previousUsers };
  };

  const returnPreviousCache = ({ variables, context }) => {
    queryClient.setQueryData(
      ["searchUsername", variables.username, variables.limit],
      context.previousUsers
    );
  };

  const mutation = useMutation({
    mutationFn: (userData) => {
      return apiFn(userData.user2Id);
    },
    // spusti se pred odeslanim zadosti na backend
    onMutate: async ({ user2Id, username, limit }) => {
      if (!username || limit == null) return;
      console.log("1111");
      return await updateFriendshipCache({ user2Id, username, limit, status });
    },
    onSuccess: async (_, variables) => {
      console.log(`${apiFn.name} success`);
      if (!variables?.username || variables.limit == null) {
        console.log("2222");
        await queryClient.invalidateQueries({ queryKey: ["searchUsername"] });
      } else {
        //znevalidni vsechny quarries s timto klicem krome aktualniho
        invalidateQuaryExcept(
          queryClient,
          "searchUsername",
          variables.username,
          variables.limit
        );
      }
    },
    onError: (error, variables, context) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error(`Error ${apiFn.name}:`, errorMessage);
      if (!variables?.username || variables.limit == null) return;
      console.log("4444");
      // pokud dojde k chybe vrati data v cache do puvodniho stavu
      returnPreviousCache({ variables, context });
    },
  });

  return mutation;
};

const useFriendMutation = () => {
  // pridani pritele (odeslani zadosti)
  const addFriendMutation = useFriendMutationItem(addFriendApi, "PENDING");

  // // zruseni odeslane zadosti o pratelstvi
  const cancelFriendRequestMutation = useFriendMutationItem(
    cancelFriendRequestApi,
    null
  );

  // odstraneni uzivatele z pratel
  const deleteFriendMutation = useFriendMutationItem(deleteFriendApi, null);

  // akceptovani prijate zadosti o pratelstvi
  const acceptFriendRequestMutation = useFriendMutationItem(
    acceptFriendRequestApi,
    "accepted"
  );

  return {
    addFriendMutation,
    cancelFriendRequestMutation,
    deleteFriendMutation,
    acceptFriendRequestMutation,
  };
};

export default useFriendMutation;
