import { verifyEmailApi } from "@/api/auth";
import { useMutation } from "@tanstack/react-query";

const useVerifyEmailMutation = ({ setIsTokenVerified }) => {
  const verifyEmailMutation = useMutation({
    mutationFn: ({ token }) => verifyEmailApi(token),
    onSuccess: async (response) => {
      console.log("Email successfully verified email");
      setIsTokenVerified("verify");
    },
    onError: (error) => {
      setIsTokenVerified("error");
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error verified email: ", errorMessage);
    },
  });
  return { verifyEmailMutation };
};

export default useVerifyEmailMutation;
