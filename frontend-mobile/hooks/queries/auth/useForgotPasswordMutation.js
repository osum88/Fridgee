import { forgotPasswordApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

const useForgotPasswordMutation = () => {
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (response) => {
      console.log("Password reset email sent successfully!");
    },
    onError: (error) => {
      console.error("Error forgot password: ", error);
    },
  });
  return { forgotPasswordMutation };
};

export default useForgotPasswordMutation;
