import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInventoryApi,
  updateInventoryApi,
  sendInventoryInvitationApi,
  acceptInventoryInvitationApi,
  rejectInventoryInvitationApi,
} from "@/api/inventory";
import { useCallback, useRef } from "react";
import debounce from "lodash.debounce";

// vytvori inventar
export const useCreateInventory = () => {
  const queryClient = useQueryClient();

  const createInventory = useMutation({
    mutationFn: (data) => {
      return createInventoryApi(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error adding inventory:", errorMessage);
    },
  });
  return { createInventory, isSubmitting: createInventory.isPending };
};

// updatuje inventory
export const useUpdateInventory = (inventoryId) => {
  const updateInventory = useMutation({
    mutationFn: (data) => updateInventoryApi(inventoryId, data),
  });
  return { updateInventory, isSubmitting: updateInventory.isPending };
};

//posila a rusi invite
export const useToggleInventoryInvitation = (inventoryId) => {
  const queryClient = useQueryClient();
  const clickCount = useRef({});
  const originalData = useRef({});
  const debouncedApis = useRef({});

  const getDebouncedApi = useCallback(
    (receiverId) => {
      if (!debouncedApis.current[receiverId]) {
        debouncedApis.current[receiverId] = debounce((resolve, reject) => {
          //pokud je pocet kllinuti sudy tak sme se vratili na puvodni stav a nemusime odesilat api
          if (clickCount.current[receiverId] % 2 === 0) {
            // obnov original data
            originalData.current[receiverId]?.forEach(([queryKey, data]) => {
              queryClient.setQueryData(queryKey, data);
            });
            clickCount.current[receiverId] = 0;
            originalData.current[receiverId] = null;
            resolve(null);
            return;
          }
          clickCount.current[receiverId] = 0;
          originalData.current[receiverId] = null;
          sendInventoryInvitationApi(inventoryId, receiverId).then(resolve).catch(reject);
        }, 500);
      }
      return debouncedApis.current[receiverId];
    },
    [inventoryId, queryClient],
  );

  return useMutation({
    mutationFn: ({ receiverId }) =>
      new Promise((resolve, reject) => {
        getDebouncedApi(receiverId)(resolve, reject);
      }),
    onMutate: async ({ receiverId }) => {
      clickCount.current[receiverId] = (clickCount.current[receiverId] ?? 0) + 1;

      // ulozi original jen pri prvnim kliku
      if (clickCount.current[receiverId] === 1) {
        const previousData = queryClient.getQueriesData({
          queryKey: ["inventory-search-users", inventoryId],
        });
        originalData.current[receiverId] = previousData;
      }

      queryClient.setQueriesData(
        { queryKey: ["inventory-search-users", inventoryId] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            data: oldData.data.map((user) =>
              user.id === receiverId
                ? { ...user, hasPendingInvitation: !user.hasPendingInvitation }
                : user,
            ),
          };
        },
      );
      return { receiverId };
    },
    onError: (_, { receiverId }) => {
      originalData.current[receiverId]?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },
  });
};

//prijme zadost
export const useAcceptInventoryInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId }) => acceptInventoryInvitationApi(invitationId),
    onMutate: async ({ invitationId }) => {
      await queryClient.cancelQueries({ queryKey: ["inventory-invitations"] });
      const previous = queryClient.getQueryData(["inventory-invitations"]);

      queryClient.setQueryData(["inventory-invitations"], (old) => ({
        ...old,
        data: old?.data?.filter((inv) => inv.id !== invitationId) ?? [],
      }));
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory-invitations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-invitations"] });
    },
  });
};

//odmitne zadost
export const useRejectInventoryInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ invitationId }) => rejectInventoryInvitationApi(invitationId),
    onMutate: async ({ invitationId }) => {
      await queryClient.cancelQueries({ queryKey: ["inventory-invitations"] });
      const previous = queryClient.getQueryData(["inventory-invitations"]);

      queryClient.setQueryData(["inventory-invitations"], (old) => ({
        ...old,
        data: old?.data?.filter((inv) => inv.id !== invitationId) ?? [],
      }));
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory-invitations"], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-invitations"] });
    },
  });
};
