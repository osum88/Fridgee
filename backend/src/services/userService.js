import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";
import { getFriendshipRepository } from "../repositories/friendRepository.js";
import {
  createUserRepository,
  deleteUserRepository,
  getBankNumberRepository,
  getUserByEmailRepository,
  getUserByIdRepository,
  getUserByUsernameRepository,
  getUserHashPasswordRepository,
  searchUsersRepository,
  updatePreferredLanguageByUserIdRepository,
  updateUserProfileImageRepository,
  updateUserRepository,
} from "../repositories/userRepository.js";
import {
  deleteImageFromCloud,
  deleteUserFolderFromCloud,
  generateImageFilename,
  getImageUpdateTimeFromCloud,
  resizeImage,
  uploadImageToCloud,
} from "../services/imageService.js";
import bcrypt from "bcrypt";
import {
  generateEpcPaymentFormat,
  generateSpaydPaymentFormat,
  isValidIbanOrBban,
} from "../utils/qrPayment.js";

export const createUserService = async (
  name,
  surname,
  username,
  birthDate,
  email,
  password,
  bankNumber,
  preferredLanguage,
) => {
  const existingUserByEmail = await getUserByEmailRepository(email);
  if (existingUserByEmail) {
    throw new ConflictError("A user with this email already exists.", {
      type: "email",
      code: "EMAIL_ALREADY_EXISTS",
    });
  }

  const existingUserByUsername = await getUserByUsernameRepository(username);
  if (existingUserByUsername) {
    throw new ConflictError("A user with this username already exists.", {
      type: "username",
      code: "USERNAME_ALREADY_EXISTS",
    });
  }

  return await createUserRepository(
    name,
    surname,
    username,
    birthDate,
    email,
    password,
    bankNumber,
    preferredLanguage,
  );
};

export const getUserByIdService = async (userId) => {
  const user = await getUserByIdRepository(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  return user;
};

// updatuje uzivatele
export const updateUserService = async (id, updateData, isAdmin) => {
  // zkontroluje zda uzivatel existuje
  const userToUpdate = await getUserByIdRepository(id);
  if (!userToUpdate) {
    throw new NotFoundError("User not found.");
  }

  //kontrola unikatnosti emailu
  if (updateData.email && updateData.email !== userToUpdate.email) {
    const existingUserByEmail = await getUserByEmailRepository(updateData?.email);
    if (existingUserByEmail) {
      throw new ConflictError("A user with this email already exists.", {
        type: "email",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }
  }

  //kontrola unikatnosti username
  if (updateData.username && updateData.username !== userToUpdate.username) {
    const existingUserByUsername = await getUserByUsernameRepository(updateData?.username);
    if (existingUserByUsername) {
      throw new ConflictError("A user with this username already exists.", {
        type: "username",
        code: "USERNAME_ALREADY_EXISTS",
      });
    }
  }

  //filtruje pouze na povolene klice
  const allowedKeys = [
    "name",
    "surname",
    "username",
    "birthDate",
    "email",
    "gender",
    "country",
    "bankNumber",
    "isAdmin",
    "preferredLanguage",
  ];
  const filteredData = Object.fromEntries(
    Object.entries(updateData).filter(([key, value]) => allowedKeys.includes(key) && value != null),
  );

  // pouze admin muze menit isAdmin
  if (!isAdmin) {
    delete filteredData.isAdmin;
  }

  // bankovni cislo lze zadat jen pokud je i vybrana zeme bankovniho cisla
  if (filteredData?.bankNumber) {
    if (!filteredData?.country) {
      throw new BadRequestError("Error country is required for bank number.", {
        type: "bankNumber",
        code: "STRING_EMPTY",
      });
    }
    const iban = isValidIbanOrBban(filteredData?.bankNumber, filteredData.country);
    filteredData.bankNumber = iban;
  }

  // pokud je prazdny retezec, nastavi na null
  if (filteredData?.birthDate === "") {
    filteredData.birthDate = null;
  }

  // pokud neni nic na updatu, vrati puvodniho uzivatele
  if (Object.keys(filteredData).length === 0) {
    return userToUpdate;
  }

  // provede update
  const updatedUser = await updateUserRepository(id, filteredData);

  if (!updatedUser) {
    throw new NotFoundError("User not found after update.");
  }
  return updatedUser;
};

// smaze uzivatele
export const deleteUserService = async (id, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(id);
  }
  const deletedUser = await deleteUserRepository(id);
  if (!deletedUser) {
    throw new NotFoundError("User not found.");
  }
  await deleteUserFolderFromCloud(`/users/${id}/profile`);

  return deletedUser;
};

//vrati bankovi cislo usera
export const getBankNumberService = async (id) => {
  const bankNumber = await getBankNumberRepository(id);

  if (bankNumber === null) {
    throw new NotFoundError("Bank number not found for given user.");
  }
  return bankNumber || { bankNumber: "" };
};

//vrati bankovni cislo usera po zadani hesla
export const getBankNumberPasswordService = async (id, password) => {
  const user = await getUserHashPasswordRepository(id);

  // overeni hesla
  const isSame = await bcrypt.compare(password, user.passwordHash);
  if (!isSame) {
    throw new BadRequestError("Wrong password", {
      type: "password",
      code: "INVALID_PASSWORD",
    });
  }
  const bankNumber = await getBankNumberRepository(id);
  return bankNumber || { bankNumber: "" };
};

//vyhleda uzivatele
export const searchUsersService = async (userId, username, limit = 10) => {
  if (!username || username.trim() === "") {
    throw new BadRequestError("Username is required for search.", {
      type: "searchUsername",
      code: "STRING_EMPTY",
    });
  }

  const sanitizedUsername = username.trim().replace(/\s+/g, "").toLowerCase();

  const users = await searchUsersRepository(userId, sanitizedUsername, parseInt(limit, 10));

  // pokud nejsou nalezeni zadni uzivatele
  if (users.length === 0) {
    return users;
  }

  const friendshipPromises = users.map((user) => getFriendshipRepository(userId, user.id));

  const friendships = await Promise.all(friendshipPromises);

  return users.map((user, index) => ({
    ...user,
    friendships: friendships[index],
  }));
};

//updatuje jazky
export const updatePreferredLanguageByUserIdService = async (id, language) => {
  const updatedUser = await updatePreferredLanguageByUserIdRepository(id, language);

  if (!updatedUser) {
    throw new NotFoundError("User not found after update.");
  }
  return updatedUser;
};

//updatuje profilovou fotku
export const updateUserProfileImageService = async (userId, image, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }

  //zmensi fotku
  const profileImageBuffer150 = await resizeImage(image, 150, "webp");
  //vytvori nazev
  const filename150 = generateImageFilename("profile", userId, 150, 150, "webp", false);
  //uploaduje fotku na cloud
  const result150 = await uploadImageToCloud(
    profileImageBuffer150,
    filename150,
    `/users/${userId}/profile`,
    ["profile", `user-${userId}`],
  );

  if (!result150) {
    throw new BadRequestError("Error uploading 150px user profile image");
  }

  // zmensi fotku
  const profileImageBuffer350 = await resizeImage(image, 350, "webp");
  //vytvori nazev
  const filename350 = generateImageFilename("profile", userId, 350, 350, "webp", false);
  //uploaduje fotku na cloud
  const result350 = await uploadImageToCloud(
    profileImageBuffer350,
    filename350,
    `/users/${userId}/profile`,
    ["profile", `user-${userId}`],
  );

  if (!result350) {
    throw new BadRequestError("Error uploading 350px user profile image");
  }

  const updateTime = await getImageUpdateTimeFromCloud(result350.fileId);

  try {
    return await updateUserProfileImageRepository(userId, `${result350.filePath}?v=${updateTime}`);
  } catch (error) {
    throw new BadRequestError("Upload succeeded, but DB update failed");
  }
};

//smaze profilovou fotku
export const deleteUserProfileImageService = async (userId, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }
  await deleteUserFolderFromCloud(`/users/${userId}/profile`);
  try {
    return await updateUserProfileImageRepository(userId, null);
  } catch (error) {
    throw new BadRequestError("Error delete profile image");
  }
};
