import { resetPasswordApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { PasswordError } from "@/errors/CustomError";

const useResetPasswordMutation = ({ setError }) => {
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }) =>
      resetPasswordApi(token, { newPassword }),
    onSuccess: async (response) => {
      console.log("Password reset successful");
    },
    onError: (error) => {
      if (error instanceof PasswordError) {
        setError(error.message);
      }
      console.error(
        "Error forgot password: ",
        error.response.data || error.message
      );
    },
  });
  return { resetPasswordMutation, isLoading: resetPasswordMutation.isPending };
};

export default useResetPasswordMutation;
