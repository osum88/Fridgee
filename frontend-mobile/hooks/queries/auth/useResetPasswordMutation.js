import { resetPasswordApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { handleApiError } from "@/utils/handleApiError";


const useResetPasswordMutation = ({ setError, setSuccess }) => {
  const resetPasswordMutation = useMutation({
    mutationFn: ({ token, newPassword }) =>
      resetPasswordApi(token, { newPassword }),
    onSuccess: async (response) => {
      console.log("Password reset successfully");
      setSuccess(true);
    },
    onError: (error) => {
      handleApiError(error, setError)
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error reset password: ", errorMessage);
    },
  });
  return { resetPasswordMutation, isLoading: resetPasswordMutation.isPending };
};

export default useResetPasswordMutation;
