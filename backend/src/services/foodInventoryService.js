import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../errors/errors.js";
import {
  changeRoleFoodInventoryUserWithHistoryRepository,
  createFoodInventoryRepository,
  createInventoryUserRepository,
  getFoodInventoryRepository,
  getFoodInventoryUserRepository,
  getFoodInventoryUserRoleRepository,
  deleteUserFoodInventoryWithHistoryRepository,
  deleteFoodInventoryRepository,
  getUsersByInventoryIdByRoleRepository,
  archiveFoodInventoryRepository,
  unarchiveFoodInventoryRepository,
  updateFoodInventoryRepository,
  getAllFoodInventoryRepository,
  changeSettingFoodInventoryUserRepository,
  getInventoryContentRepository,
  searchUsersForInventoryRepository,
  transferOwnershipRepository,
  getInventoryOwnerRepository,
  leaveInventoryRepository,
} from "../repositories/foodInventoryRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";
import { compareLocale, sortBy } from "../utils/sort.js";
import {  formatTitleCase } from "../utils/stringUtils.js";
import { convertPrice, createBaseCurrency } from "./priceService.js";

// vytvari inventar s jidlem
export const createFoodInventoryService = async (userId, title, icon, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }
  if (!title) {
    throw new BadRequestError("Title is required for a new food inventory.", {
      type: "foodTitle",
      code: "STRING_EMPTY",
    });
  }
  return await createFoodInventoryRepository(userId, title, icon);
};

export const createInventoryUserService = async (userId, inventoryId, role, isAdmin) => {
  if (isNaN(inventoryId)) {
    throw new BadRequestError("Invalid inventory ID provided.");
  }

  if (isAdmin) {
    await getUserByIdRepository(userId);
  }
  await getFoodInventoryRepository(inventoryId);

  // kontrola, zda uživatel již v inventari neni
  const existingInventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
  if (existingInventoryUser) {
    throw new ConflictError("User is already in this inventory.");
  }

  // vytvoreni noveho zaznamu
  const newInventoryUser = await createInventoryUserRepository(userId, inventoryId, role);
  if (!newInventoryUser) {
    throw new InternalServerError("Failed to add user to inventory.");
  }
  return newInventoryUser;
};

//zmeni roli usera
export const changeRoleInventoryUserService = async (
  ownerId,
  inventoryId,
  targetUserId,
  newRole,
  isAdmin,
) => {
  //kontrola role odesilatele
  if (!isAdmin) {
    const ownerRole = await getFoodInventoryUserRoleRepository(ownerId, inventoryId);
    if (!ownerRole || ownerRole.role !== "OWNER") {
      throw new ForbiddenError("Only an OWNER can change user roles in this inventory.");
    }
  } else {
    const owner = await getInventoryOwnerRepository(inventoryId);
    ownerId = owner?.userId;
  }

  // kontrola existence cilového uzivatele v inventari
  const targetUser = await getFoodInventoryUserRoleRepository(targetUserId, inventoryId);
  if (!targetUser) {
    throw new NotFoundError("Target user is not a member of this inventory.");
  }

  // zabrani ownerovi zmenit vlastni roli
  if (ownerId === targetUserId) {
    return false;
  }

  // pokud je role stejna, nemusime nic menit
  if (targetUser.role === newRole) {
    return targetUser;
  }

  if (newRole === "OWNER") {
    return await transferOwnershipRepository(targetUserId, ownerId, inventoryId, targetUser.role);
  }

  // vytvoreni noveho zaznamu
  return await changeRoleFoodInventoryUserWithHistoryRepository(
    targetUserId,
    inventoryId,
    newRole,
    ownerId,
    targetUser.role,
  );
};

//smaze uzivatele inventare
export const leaveInventoryService = async (userId, inventoryId, newOwnerId = null) => {
  // kontrola existence uzivatele v inventari
  const userInventory = await getFoodInventoryUserRepository(userId, inventoryId, false);
  if (!userInventory) {
    throw new NotFoundError("User is not a member of this inventory.");
  }

  //pokud neni owner tak se jen smaze
  if (userInventory.role !== "OWNER") {
    const deletedUser = await deleteUserFoodInventoryWithHistoryRepository(
      userId,
      inventoryId,
      userId,
      userInventory.role,
      "MEMBER_LEFT",
    );
    return { message: "User removed successfully.", data: deletedUser };
  }
  return await leaveInventoryRepository(userId, inventoryId, newOwnerId, userInventory?.role);
};

//owner smaze jineho uzivatele z inventare
export const deleteOtherFoodInventoryUserService = async (removerId, inventoryId, targetUserId) => {
  // kontrola ze neodstranuje sam sebe
  if (removerId === targetUserId) {
    throw new BadRequestError("You cannot remove yourself. Please use the self-removal function.");
  }
  // kontrola existence odstranujiciho uzivatele v inventari
  const removerInventoryUser = await getFoodInventoryUserRepository(removerId, inventoryId, false);
  if (!removerInventoryUser) {
    throw new ForbiddenError("You do not have permission to perform this action.");
  }

  // pouze owner muze smazat jineho uzivatele
  if (removerInventoryUser.role !== "OWNER") {
    throw new ForbiddenError("Only the owner of the inventory can remove other users.");
  }
  // kontrola existence cilového uzivatele v inventari
  const targetInventoryUser = await getFoodInventoryUserRepository(targetUserId, inventoryId, false);
  if (!targetInventoryUser) {
    throw new NotFoundError("Target user is not a member of this inventory.");
  }

  // smazani ciloveho uzivatele z inventare
  return await deleteUserFoodInventoryWithHistoryRepository(
    targetUserId,
    inventoryId,
    removerId,
    targetInventoryUser?.role,
    "MEMBER_REMOVED",
  );
};

//vrati uzivatele podle id a role
export const getUsersByInventoryIdByRoleService = async (
  userId,
  inventoryId,
  rolesToFilter,
  isAdmin,
) => {
  await getFoodInventoryRepository(inventoryId);

  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError("You do not have permission to view users in this inventory.");
    }
  }

  // vrati uzivatele z inventare
  return await getUsersByInventoryIdByRoleRepository(inventoryId, rolesToFilter);
};

//vrati uzivatele podle id a role
export const getUsersByInventoryIdService = async (
  userId,
  inventoryId,
  isAdmin,
  sortByString = "resultName",
) => {
  await getFoodInventoryRepository(inventoryId);

  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new ForbiddenError("You do not have permission to view users in this inventory.");
    }
  }
  // vrati uzivatele z inventare
  const result = await getUsersByInventoryIdByRoleRepository(inventoryId, null);
  const mapped = result.map((data) => ({
    userId: data.user.id,
    name: data.user?.name || "",
    username: data.user?.username || "",
    surname: data.user?.surname || "",
    profilePictureUrl: data.user?.profilePictureUrl || "",
    role: data?.role || "",
    resultName:
      data.user.name && data.user.surname
        ? `${formatTitleCase(data.user.name)} ${formatTitleCase(data.user.surname)}`
        : formatTitleCase(data.user.username),
  }));

  const key = sortByString === "username" ? "username" : "resultName";
  return sortBy(mapped, key);
};

//archivace inventare
export const archiveFoodInventoryService = async (userId, inventoryId, isArchived, isAdmin) => {
  const inventory = await getFoodInventoryRepository(inventoryId);
  if (inventory.isArchived === isArchived) {
    return inventory;
  }

  // kontrola existence cilového uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    if (!inventoryUser) {
      throw new NotFoundError("User is not a member of this inventory.");
    }

    // pouze owner muze archivocat inventar
    if (inventoryUser.role !== "OWNER") {
      throw new ForbiddenError("Only the owner of the inventory can un/archive inventary.");
    }
  }
  // archivace inventare
  let updatedInventory;
  if (isArchived) {
    updatedInventory = await archiveFoodInventoryRepository(inventoryId);
  } else {
    updatedInventory = await unarchiveFoodInventoryRepository(inventoryId);
  }

  if (!updatedInventory) {
    throw new InternalServerError("Failed to un/archive the inventory.");
  }
  return updatedInventory;
};

//updatuje nazev a icon inventare
export const updateFoodInventoryService = async (userId, inventoryId, title, icon, isAdmin) => {
  // kontrola existence uzivatele v inventari
  if (!isAdmin) {
    const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
    // pouze owner muze updatovat inventar
    if (!inventoryUser || inventoryUser.role !== "OWNER") {
      throw new ForbiddenError("Only the owner of the inventory can update inventory.");
    }
  }

  // updatuje title a icon inventare
  return await updateFoodInventoryRepository(inventoryId, title, icon);
};

//vrati vsechny inventare uzivatele
export const getAllFoodInventoryService = async (userId, isAdmin) => {
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }

  // vrati inventare
  const result = await getAllFoodInventoryRepository(userId);

  return result.map((item) => {
    const { users, ...rest } = item;
    const userContext = users && users.length > 0 ? users[0] : {};
    return {
      ...rest,
      ...userContext,
    };
  });
};

//vrati invetar s informacemi o uzivateli
export const getInventoryDetailsWithUserService = async (userId, inventoryId, isAdmin) => {
  if (isNaN(inventoryId)) {
    throw new BadRequestError("Invalid inventory ID provided.");
  }
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }
  const inventory = await getFoodInventoryRepository(inventoryId);

  // kontrola existence uzivatele v inventari
  const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
  if (!inventoryUser) {
    throw new ForbiddenError("Only the member of the inventory can view it.");
  }

  // spojeni dat do jednoho objektu
  return {
    id: inventory?.id || null,
    title: inventory?.title || null,
    icon: inventory?.icon || null,
    role: inventoryUser?.role || null,
    joinedAt: inventoryUser?.joinedAt || null,
    notificationSettings: inventoryUser?.notificationSettings || null,
  };
};

//zmena settingu pro uzivatele
export const changeSettingFoodInventoryUserService = async (
  userId,
  inventoryId,
  settings,
  isAdmin,
) => {
  if (isNaN(inventoryId)) {
    throw new BadRequestError("Invalid inventory ID provided.");
  }
  if (isAdmin) {
    await getUserByIdRepository(userId);
  }

  // kontrola existence cilového uzivatele v inventari
  const inventoryUser = await getFoodInventoryUserRepository(userId, inventoryId, false);
  if (!inventoryUser) {
    throw new NotFoundError("You do not have permission to modify settings in this inventory.");
  }

  // zmena settingu usera
  return await changeSettingFoodInventoryUserRepository(userId, inventoryId, settings);
};

// vrati vsechny jidla s kategoriemi, instancemi a labely
export const getInventoryContentService = async (inventoryId, userId, isAdmin) => {
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }
  const currency = await createBaseCurrency(userId, null);

  const foods = await getInventoryContentRepository(inventoryId, userId);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  //seskupeni potravin pomoci kategorii
  const grouped = foods.reduce((acc, food) => {
    const categoryId = food.categoryId || "no-category";

    // pokud kategorie jeste neni v akumulatoru pak se inicializuje
    if (!acc[categoryId]) {
      acc[categoryId] = {
        categoryId: categoryId,
        categoryTitle: food.category?.title || "unknow",
        foods: [],
      };
    }

    const userCustomLabel = food.catalog.labels[0];
    const activeLabel = userCustomLabel || food.label;

    const labelTitle = activeLabel?.title;
    const normalizedTitle = activeLabel?.normalizedTitle;
    const labelFoodImageUrl = activeLabel?.foodImageUrl;
    const foodImageCloudId = activeLabel?.foodImageCloudId;
    const labelDescription = activeLabel?.description;

    let expiredCount = 0;
    let expiringSoonCount = 0;
    let validCount = 0;

    // Agregace instanci potravin (seskupení podle data expirace, ceny a množství)
    const aggregatedMap = food.instances.reduce((iAcc, inst) => {
      if (!inst.expirationDate) {
        validCount += 1;
      } else if (inst.expirationDate < today) {
        expiredCount += 1;
      } else if (inst.expirationDate <= nextWeek) {
        expiringSoonCount += 1;
      } else {
        validCount += 1;
      }

      //prepocet ceny
      const convertedPrice = inst.priceId
        ? convertPrice(
            inst?.price?.price,
            inst?.price?.exchangeRate,
            inst?.price?.exchangeAmount,
            inst?.price?.baseCurrency,
            currency,
          )
        : null;

      //klice pro agregaci
      const priceKey = convertedPrice !== null ? convertedPrice.toFixed(2) : "no-price";
      const dateKey = inst.expirationDate
        ? inst.expirationDate.toISOString().split("T")[0]
        : "no-date";
      const amountUnitKey = inst?.amount > 0 ? `${inst.amount}_${inst.unit}` : "no-amount-unit";

      const groupKey = `${dateKey}_${priceKey}_${amountUnitKey}`;

      if (!iAcc[groupKey]) {
        iAcc[groupKey] = {
          expirationDate: inst?.expirationDate,
          price: convertedPrice ? Number(convertedPrice.toFixed(2)) : 0,
          currency: currency,
          amount: inst?.amount || 0,
          unit: inst?.amount > 0 ? inst.unit : null,
          count: 0,
          instanceIds: [],
        };
      }
      iAcc[groupKey].count += 1;
      iAcc[groupKey].instanceIds.push(inst.id);
      return iAcc;
    }, {});

    const instanceArray = Object.values(aggregatedMap).sort((a, b) => {
      if (!a.expirationDate && b.expirationDate) return 1;
      if (a.expirationDate && !b.expirationDate) return -1;
      if (!a.expirationDate && !b.expirationDate) return 0;
      return new Date(a.expirationDate) - new Date(b.expirationDate);
    });

    acc[categoryId].foods.push({
      foodId: food.id,
      catalogId: food.catalogId,
      labelTitle: labelTitle,
      normalizedTitle: normalizedTitle,
      labelDescription: labelDescription,
      labelFoodImageUrl: labelFoodImageUrl,
      foodImageCloudId: foodImageCloudId,
      variantTitle: food.variant?.title || "",
      variantId: food.variant?.id || null,
      barcode: food?.catalog?.barcode || "",
      minimalQuantity: food.minimalQuantity || 0,
      expiredCount: expiredCount || 0,
      expiringSoonCount: expiringSoonCount || 0,
      validCount: validCount || 0,
      instances: instanceArray,
    });
    return acc;
  }, {});

  //prevede objekt na pole
  const categoriesArray = Object.values(grouped);

  // seradi jidlo abecedne podle nazvu a podle varinaty uvnitr kazde kategorie
  categoriesArray.forEach((category) => {
    category.foods.sort((a, b) => {
      const nameCompare = compareLocale(a.labelTitle, b.labelTitle);
      // pokud jsou nazvy ruzne tak vracime porovnani
      if (nameCompare !== 0) return nameCompare;

      // pokud jsou stejne pak radime podle variantTitle
      if (!a.variantTitle && b.variantTitle) return -1;
      if (a.variantTitle && !b.variantTitle) return 1;
      if (!a.variantTitle && !b.variantTitle) return 0;

      // pokud jsou obe varianty vyplnené, seradi je abecedne
      return compareLocale(a.variantTitle, b.variantTitle);
    });
  });

  // seradi kategorie akbecedne a "unknow" umisti prvni
  return categoriesArray.sort((a, b) => {
    if (a.categoryTitle === "unknow") return -1;
    if (b.categoryTitle === "unknow") return 1;
    return compareLocale(a.categoryTitle, b.categoryTitle);
  });
};

//vyhleda usery pro pridani do inventare
export const searchUsersForInventoryService = async (
  userId,
  isAdmin,
  inventoryId,
  username,
  limit = 10,
) => {
  if (!isAdmin) {
    await getFoodInventoryUserRepository(userId, inventoryId);
  }
  const resultLimit = Math.max(1, Math.min(limit, 100));
  return await searchUsersForInventoryRepository(
    userId,
    inventoryId,
    username?.toLowerCase(),
    resultLimit,
  );
};
