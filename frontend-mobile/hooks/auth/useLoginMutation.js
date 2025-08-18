import { useMutation } from "@tanstack/react-query";
import { loginApi } from "@/api/auth";
import { useUser } from "@/hooks/useUser";
import i18n from "@/constants/translations";


const useLoginMutation = ({ setError, rememberMe }) => {
  const { signIn } = useUser();

  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data;

      console.log("Přihlášení úspěšné:", response.message);
      console.log("Přístupový token:", accessToken);
      console.log("Refresh token:", refreshToken);
      console.log("Uživatelská data:", user);

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
