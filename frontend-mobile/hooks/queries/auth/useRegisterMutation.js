import { signupApi } from "@/api/auth";
import { useUser } from "@/hooks/useUser";
import i18n from "@/constants/translations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/utils/handleApiError";

const useRegisterMutation = ({ setErrors, errors }) => {
  const { signIn } = useUser();

  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: signupApi,
    onSuccess: async (response) => {
      const { accessToken, refreshToken, user } = response.data.responseData;
      await queryClient.invalidateQueries({ queryKey: ["user"] });

      console.log(`User ${user.username} registry sucesfully`);
      try {
        if (
          accessToken &&
          typeof accessToken === "string" &&
          refreshToken &&
          typeof refreshToken === "string"
        ) {
          await signIn(accessToken, refreshToken, user);
        } else {
          console.error("Tokens not valid.");
        }
      } catch (err) {
        console.error("Error saving refresh token:", err);
        setErrors({ email: " ", username: " ", password: i18n.t("errorDefault") });
      }
    },
    onError: (error) => {
      console.error("Error registry:", error);
      handleApiError(error, setErrors, errors, "password");
    },
  });
  return { registerMutation, isLoading: registerMutation.isPending };
};

export default useRegisterMutation;
