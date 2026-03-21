import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createInventoryApi,
  updateInventoryApi,
  sendInventoryInvitationApi,
  acceptInventoryInvitationApi,
  rejectInventoryInvitationApi,
  changeRoleInventoryUserApi,
  deleteInventoryUserApi,
  leaveInventoryApi,
} from "@/api/inventory";
import { useCallback, useRef } from "react";
import debounce from "lodash.debounce";
import { useInventoryStore } from "@/hooks/store/useInventoryStore";
import { invalidateQueries } from "@/utils/invalidateQueries";
import { router } from "expo-router";

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

//zmeni roli
export const useChangeRoleInventoryUser = (inventoryId) => {
  const queryClient = useQueryClient();
  const setActiveInventory = useInventoryStore((state) => state.setActiveInventory);

  return useMutation({
    mutationFn: ({ targetUserId, newRole }) =>
      changeRoleInventoryUserApi(inventoryId, targetUserId, newRole),
    onMutate: async ({ targetUserId, newRole }) => {
      await queryClient.cancelQueries({ queryKey: ["inventory-users-username", inventoryId] });
      const previous = queryClient.getQueryData(["inventory-users-username", inventoryId]);

      queryClient.setQueryData(["inventory-users-username", inventoryId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((user) =>
            user.userId === targetUserId ? { ...user, role: newRole } : user,
          ),
        };
      });
      if (newRole === "OWNER") {
        setActiveInventory({ role: "EDITOR" });
      }
      return { previous, newRole };
    },
    onSuccess: (_, __, context) => {
      if (context?.newRole === "OWNER") {
        setActiveInventory({ role: "EDITOR" });
        invalidateQueries(queryClient, [["inventories"], ["food-inventory", inventoryId]]);
      }
      queryClient.invalidateQueries({ queryKey: ["inventory-history", inventoryId] });
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory-users-username", inventoryId], context.previous);
      }

      if (context?.newRole === "OWNER") {
        setActiveInventory({ role: "OWNER" });
        invalidateQueries(queryClient, [["inventories"], ["food-inventory", inventoryId]]);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-users-username", inventoryId] });
    },
  });
};

//owner odstrani jinyho uzivatele z inventare
export const useDeleteInventoryUser = (inventoryId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ targetUserId }) => deleteInventoryUserApi(inventoryId, targetUserId),
    onMutate: async ({ targetUserId }) => {
      await queryClient.cancelQueries({ queryKey: ["inventory-users-username", inventoryId] });
      const previous = queryClient.getQueryData(["inventory-users-username", inventoryId]);

      queryClient.setQueryData(["inventory-users-username", inventoryId], (old) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((user) => user.userId !== targetUserId),
        };
      });
      return { previous };
    },
    onSuccess: () => {
      invalidateQueries(queryClient, [
        ["inventories"],
        ["food-inventory", inventoryId],
        ["food-inventory-resultName", inventoryId],
        ["inventory-history", inventoryId],
      ]);
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["inventory-users-username", inventoryId], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-users-username", inventoryId] });
    },
  });
};

//opusteni invenare
export const useLeaveInventory = () => {
  const queryClient = useQueryClient();
  const clearActiveInventory = useInventoryStore((state) => state.clearActiveInventory);

  return useMutation({
    mutationFn: ({ inventoryId, newOwnerId }) => leaveInventoryApi(inventoryId, newOwnerId),
    onSuccess: (_, { inventoryId }) => {
      clearActiveInventory();
      invalidateQueries(queryClient, [["inventories"], ["food-inventory", inventoryId]]);
      router.replace("/(protected)/(menu)/(tabs)");
    },
  });
};
