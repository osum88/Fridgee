import i18n from "@/constants/translations";
import apiClient from "@/utils/api-client";
import {
  NameError,
  SurnameError,
  BirthDateError,
  GenderError,
  CountryError,
  BankNumberError,
  EveryError,
} from "@/errors/CustomError";
import { hasValidationError } from "@/utils/stringUtils";

//vrati uzivatele podle id
export const getUserByIdApi = async (userData) => {
  try {
    const response = await apiClient.get("/users", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error in getUserByIdApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje jazyk
export const updatePreferredLanguageApi = async (userData) => {
  try {
    const response = await apiClient.patch("/users/language", userData);
    return response.data;
  } catch (error) {
    console.error(
      "Error in updatePreferredLanguageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//vyhleda uzivatele podle username
export const searchUsersApi = async (username, limit = 8) => {
  try {
    const response = await apiClient.get(
      `/users/search?username=${username}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error in searchUsersApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje profile image
export const updateUserProfileImageApi = async (file) => {
  try {
    const response = await apiClient.patch("/users/profile-image", file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error in uploadProfileImageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//updatuje profile image
export const deleteUserProfileImageApi = async () => {
  try {
    const response = await apiClient.delete("/users/profile-image");
    return response.data;
  } catch (error) {
    console.error(
      "Error in deleteUserProfileImageApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

//vrati bankovni cislo po zadani hesla
export const getBankNumberPasswordApi = async (data) => {
  try {
    const response = await apiClient.post("/users/bank-number", data);
    return response.data;
  } catch (error) {
    console.warn(error);

    console.error(
      "Error in getBankNumberPassword: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    if (error.response) {
      if (
        error.response.status === 400 &&
        (error.response.data.message === "Wrong password" ||
          error.response.data.message === "Validation failed" ||
          error.response.data.message === "Wrong email or password")
      ) {
        throw new Error(i18n.t("errorPassword"));
      } else if (error.response.status === 429) {
        throw new Error(i18n.t("errorTooManyRequest"));
      } else {
        throw new Error(i18n.t("errorDefault"));
      }
    } else if (error.request) {
      throw new Error(i18n.t("errorNetwork"));
    } else {
      throw new Error(i18n.t("errorDefault"));
    }
  }
};

//vrati bankovni cislo po zadani hesla
export const updateProfileApi = async (data) => {
  try {
    const response = await apiClient.patch("/users", data);
    return response.data;
  } catch (error) {
    console.log("1--------------------------------------------------------");
    console.log(data.country);
    console.log({ error });
    console.log("2--------------------------------------------------------");
    // console.log(error?.response);
    console.log("3--------------------------------------------------------");

    console.log(error?.response?.data);
    console.log("4--------------------------------------------------------");

    console.error(
      "Error in updateProfileApi: ",
      error,
      "->",
      error.response?.data?.message || error.message
    );
    if (error.response) {
      const errorData = error?.response?.data?.errors;
      const errorMessage = error?.response?.data?.message;
      console.log(errorMessage)
      console.log("--------------sds-----------sdsd-------------")
      if (error.response.status === 400) {
        if (errorMessage === "Error country is required for bank number.") {
          throw new BankNumberError(i18n.t("errorBankNumberNeedCountry"));
        }

        if (
          errorMessage === "SPAYD generation failed or returned invalid format."
        ) {
          throw new BankNumberError(i18n.t("errorBankNumberInvalid"));
        }

        if (errorMessage === "Error generate SPAYD payment format.") {
          throw new BankNumberError(i18n.t("errorBankNumberInvalid"));
        }

        if (errorMessage === "Invalid bank number format.") {
          if (data?.country === "OTHER") {
            throw new BankNumberError(i18n.t("invalidIbanFormat"));
          } else {
            throw new BankNumberError(i18n.t("invalidBankAccountFormat"));
          }
        }

        if (errorMessage === "Converted IBAN is invalid.") {
          throw new BankNumberError(i18n.t("invalidBankAccountFormat"));
        }

        if (errorMessage === "Invalid IBAN format.") {
          throw new BankNumberError(i18n.t("invalidIbanFormat"));
        }

        if (errorMessage === "Invalid IBAN or bank number format.") {
          throw new BankNumberError(i18n.t("errorBankNumberInvalid"));
        }

        if (errorMessage === "Validation failed") {
          if (hasValidationError("name", errorData)) {
            throw new NameError(i18n.t("errorName"));
          }
          if (hasValidationError("surname", errorData)) {
            throw new SurnameError(i18n.t("errorSurname"));
          }
          if (hasValidationError("birthDate", errorData)) {
            throw new BirthDateError(i18n.t("errorBirthDateInFuture"));
          }
          if (hasValidationError("bankNumber", errorData)) {
            throw new BankNumberError(i18n.t("errorBankNumberInvalid"));
          }
          if (hasValidationError("gender", errorData)) {
            throw new GenderError(i18n.t("errorGender"));
          }
          if (hasValidationError("country", errorData)) {
            throw new CountryError(i18n.t("errorCountry"));
          }
        }
        throw new EveryError(i18n.t("errorDefault"));
      } else if (error.response.status === 429) {
        throw new EveryError(i18n.t("errorTooManyRequest"));
      } else {
        throw new EveryError(i18n.t("errorDefault"));
      }
    } else if (error.request) {
      throw new EveryError(i18n.t("errorNetwork"));
    } else {
      throw new EveryError(i18n.t("errorDefault"));
    }
  }
};
