import { logoutApi } from "@/api/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Error logout user: ", error);
    },
  });
  return { logoutMutation };
};

export default useLogoutMutation;
