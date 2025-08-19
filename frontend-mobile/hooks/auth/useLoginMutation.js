import { loginApi } from "@/api/auth";
import { useUser } from "@/hooks/useUser";
import i18n from "@/constants/translations";
import { useMutation, useQueryClient } from "@tanstack/react-query";


const useLoginMutation = ({ setError, rememberMe }) => {
  const { signIn } = useUser();
  // const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;

      // await queryClient.invalidateQueries({ queryKey: ["user"] });

      console.log(`User ${user.username} log sucesfully`);
      console.log("refreshToken:", refreshToken);
      try {
        if (
          accessToken &&
          typeof accessToken === "string" &&
          refreshToken &&
          typeof refreshToken === "string"
        ) {
          await signIn(accessToken, refreshToken, user, rememberMe);
        } else {
          console.error("Tokens not valid.");
        }
      } catch (err) {
        console.error("Error saving refresh token:", err);
        setError(i18n.t("errorDefault"));
      }
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  return { loginMutation, isLoading: loginMutation.isPending };
};

export default useLoginMutation;
