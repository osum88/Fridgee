import { getBankNumberPasswordApi } from "@/api/user";
import { useMutation } from "@tanstack/react-query";

const useGetBankNumberPassword = () => {
  const getBankNumberPassword = useMutation({
    mutationFn: getBankNumberPasswordApi,
    onSuccess: async (response) => {
      console.log("Bank number show succesffuly");
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || error.message;
      console.error("Error fetching bank number:", errorMessage);
    },
  });

  return { getBankNumberPassword, isLoading: getBankNumberPassword.isPending };
};

export default useGetBankNumberPassword;
