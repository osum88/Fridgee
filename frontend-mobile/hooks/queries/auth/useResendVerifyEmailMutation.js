import { resendVerifyEmailApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";
import { EmailError } from "@/errors/CustomError";

const useResendVerifyEmailMutation = ({ setError }) => {
  const resendVerifyEmailMutation = useMutation({
    mutationFn: resendVerifyEmailApi,
    onSuccess: async (response) => {
      console.log("Email resend successfullly");
    },
    onError: (error) => {
      if (error instanceof EmailError) {
        setError(error.message);
      }
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error resend email verify: ", errorMessage);
    },
  });
  return { resendVerifyEmailMutation };
};

export default useResendVerifyEmailMutation;
