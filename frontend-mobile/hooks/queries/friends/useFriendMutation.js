import {
  addFriendApi,
  deleteFriendApi,
  cancelFriendRequestApi,
  acceptFriendRequestApi,
} from "@/api/friend";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { invalidateQuaryExcept } from "@/utils/invalidateQuaryExcept";

const useFriendMutationItem = (apiFn) => {
  const queryClient = useQueryClient();

  const returnPreviousCache = ({ variables, context }) => {
    const key =
      variables.limit == null
        ? [variables.cache, variables.username]
        : [variables.cache, variables.username, variables.limit];
    queryClient.setQueryData(key, variables.previousUsers);
  };

  const mutation = useMutation({
    mutationFn: (userData) => {
      return apiFn(userData.user2Id);
    },
    // spusti se pred odeslanim zadosti na backend
    onMutate: async ({ user2Id, username, limit, cache, previousUsers }) => {
      if (!username) return;

      const key = limit == null ? [cache, username] : [cache, username, limit];
      //zrusi probihajici dotazy s klicem
      await queryClient.cancelQueries({
        queryKey: key,
      });
      
    },
    onSuccess: async (_, variables) => {
      console.log(`${apiFn.name} success`);
      if (!variables?.username) {
        await queryClient.invalidateQueries({ queryKey: [variables.cache] });
      } else if (variables.limit == null) {
        invalidateQuaryExcept(queryClient, variables.cache, variables.username);
      } else {
        //znevalidni vsechny quarries s timto klicem krome aktualniho
        invalidateQuaryExcept(
          queryClient,
          variables.cache,
          variables.username,
          variables.limit
        );
      }
    },
    onError: (error, variables, context) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error(`Error ${apiFn.name}:`, errorMessage);
      if (!variables?.username) return;
      // pokud dojde k chybe vrati data v cache do puvodniho stavu
      returnPreviousCache({ variables, context });
    },
  });

  return mutation;
};

const useFriendMutation = () => {
  // pridani pritele (odeslani zadosti)
  const addFriendMutation = useFriendMutationItem(addFriendApi);

  // // zruseni odeslane zadosti o pratelstvi
  const cancelFriendRequestMutation = useFriendMutationItem(
    cancelFriendRequestApi
  );

  // odstraneni uzivatele z pratel
  const deleteFriendMutation = useFriendMutationItem(deleteFriendApi);

  // akceptovani prijate zadosti o pratelstvi
  const acceptFriendRequestMutation = useFriendMutationItem(
    acceptFriendRequestApi
  );

  return {
    addFriendMutation,
    cancelFriendRequestMutation,
    deleteFriendMutation,
    acceptFriendRequestMutation,
  };
};

export default useFriendMutation;
