import { ConflictError, NotFoundError } from "../errors/errors.js";
import prisma from "../utils/prisma.js";
import { sortBy } from "../utils/sort.js";
import {  formatTitleCase } from "../utils/stringUtils.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryRepository = async (userId, title, icon) => {
  try {
    return await prisma.foodInventory.create({
      data: {
        title: formatTitleCase(title),
        icon: icon,
        memberCount: 1,
        users: {
          create: { userId: userId, role: "OWNER" },
        },
      },
      include: { users: true },
    });
  } catch (error) {
    console.error("Error creating food inventory:", error);
    throw error;
  }
};

// vytvori usera food inventare
export const createInventoryUserRepository = async (userId, invitation) => {
  try {
    const [newInventoryUser, updatedFoodInventory, historyRecord] = await prisma.$transaction([
      prisma.inventoryUser.create({
        data: {
          userId: userId,
          inventoryId: invitation?.inventoryId,
          role: invitation?.role,
        },
      }),
      prisma.foodInventory.update({
        where: { id: invitation?.inventoryId },
        data: {
          memberCount: { increment: 1 },
        },
      }),
      prisma.foodHistory.create({
        data: {
          inventoryId: invitation?.inventoryId,
          action: "USER_JOINED",
          changedBy: invitation?.senderId,
          metadata: {
            user: {
              userId: userId,
              role: invitation?.role,
            },
          },
        },
      }),
    ]);
    return { newInventoryUser, updatedFoodInventory, historyRecord };
  } catch (error) {
    console.error("Error creating new inventory user:", error);
    throw error;
  }
};

// ziskani inventare podle id
export const getFoodInventoryRepository = async (foodInventoryId) => {
  try {
    const foodInventory = await prisma.foodInventory.findUnique({
      where: { id: foodInventoryId },
    });
    if (!foodInventory) {
      throw new NotFoundError("Food inventory not found");
    }
    return foodInventory;
  } catch (error) {
    console.error("Error fetching food inventory by Id:", error);
    throw error;
  }
};

// hleda user jestli je user v danem inventari podle id
export const getFoodInventoryUserRepository = async (
  userId,
  foodInventoryId,
  throwError = true,
  tx = prisma,
) => {
  try {
    const user = await tx.inventoryUser.findUnique({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
    });
    if (!user && throwError) {
      throw new NotFoundError("User not found in inventory");
    }
    return user;
  } catch (error) {
    console.error("Error fetching user in inventory by Id:", error);
    throw error;
  }
};

// zmena role user v inventari
export const changeRoleFoodInventoryUserWithHistoryRepository = async (
  userId,
  foodInventoryId,
  role,
  changedBy,
  previousRole,
  tx,
) => {
  const run = async (client) => {
    const updatedUser = await client.inventoryUser.update({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
      data: { role: role },
    });

    await client.foodHistory.create({
      data: {
        inventoryId: foodInventoryId,
        action: "ROLE_CHANGE",
        changedBy: changedBy,
        metadata: {
          user: { userId: userId },
          role: {
            before: previousRole,
            after: role,
          },
        },
      },
    });
    return updatedUser;
  };
  try {
    return tx ? await run(tx) : await prisma.$transaction(run);
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

// orevede vlastnictvi
export const transferOwnershipRepository = async (
  newOwnerId,
  currentOwnerId,
  foodInventoryId,
  previousRole,
) => {
  try {
    const [updatedNewOwner, updatedPreviousOwner] = await prisma.$transaction(async (tx) => {
      // zmena role noveho ownera
      const newOwner = await tx.inventoryUser.update({
        where: {
          userId_inventoryId: {
            userId: newOwnerId,
            inventoryId: foodInventoryId,
          },
        },
        data: { role: "OWNER" },
      });

      // zmena role stareho ownera na editora
      const previousOwner = await tx.inventoryUser.update({
        where: {
          userId_inventoryId: {
            userId: currentOwnerId,
            inventoryId: foodInventoryId,
          },
        },
        data: { role: "EDITOR" },
      });

      // historie pro noveho ownera
      await tx.foodHistory.create({
        data: {
          inventoryId: foodInventoryId,
          action: "ROLE_CHANGE",
          changedBy: currentOwnerId,
          metadata: {
            user: { userId: newOwnerId },
            role: { before: previousRole, after: "OWNER" },
          },
        },
      });

      // historie pro stareho ownera
      await tx.foodHistory.create({
        data: {
          inventoryId: foodInventoryId,
          action: "ROLE_CHANGE",
          changedBy: currentOwnerId,
          metadata: {
            user: { userId: currentOwnerId },
            role: { before: "OWNER", after: "EDITOR" },
          },
        },
      });

      return [newOwner, previousOwner];
    });

    return { updatedNewOwner, updatedPreviousOwner };
  } catch (error) {
    console.error("Error transferring ownership:", error);
    throw error;
  }
};

//vrati roli uzivatele v inventari
export const getFoodInventoryUserRoleRepository = async (userId, foodInventoryId) => {
  try {
    const role = await prisma.inventoryUser.findUnique({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
      select: { role: true },
    });
    if (!role) {
      throw new NotFoundError("User role in inventory not found");
    }
    return role;
  } catch (error) {
    console.error("Error fetching role in inventory by Id:", error);
    throw error;
  }
};

//vrati ownera
export const getInventoryOwnerRepository = async (inventoryId) => {
  try {
    return await prisma.inventoryUser.findFirst({
      where: {
        inventoryId: inventoryId,
        role: "OWNER",
      },
    });
  } catch (error) {
    console.error("Error fetching inventory owner:", error);
    throw error;
  }
};

//smaze uzivatele inventare
export const deleteUserFoodInventoryWithHistoryRepository = async (
  userId,
  inventoryId,
  removedBy,
  role,
  action = "MEMBER_REMOVED",
  tx,
) => {
  const run = async (client) => {
    const [deletedUser, updatedFoodInventory] = await Promise.all([
      client.inventoryUser.delete({
        where: {
          userId_inventoryId: {
            userId: userId,
            inventoryId: inventoryId,
          },
        },
      }),
      client.foodInventory.update({
        where: { id: inventoryId },
        data: {
          memberCount: { decrement: 1 },
        },
      }),
      client.foodHistory.create({
        data: {
          inventoryId: inventoryId,
          action: action,
          changedBy: removedBy,
          metadata: {
            user: {
              userId: userId,
              role: role,
            },
          },
        },
      }),
    ]);
    return { deletedUser, updatedFoodInventory };
  };
  try {
    return tx ? await run(tx) : await prisma.$transaction(run);
  } catch (error) {
    console.error("Error deleting user in inventory:", error);
    throw error;
  }
};

//smaze inventar
export const deleteFoodInventoryRepository = async (inventoryId, tx = prisma) => {
  try {
    return await tx.foodInventory.delete({
      where: { id: inventoryId },
    });
  } catch (error) {
    console.error("Error deleting food inventory:", error);
    throw error;
  }
};

//opusteni inventare pro ownera
export const leaveInventoryRepository = async (userId, inventoryId, newOwnerId, userRole) => {
  try {
    return await prisma.$transaction(async (tx) => {
      const usersCount = await getInventoryUserCountRepository(inventoryId, tx);
      if (usersCount > 1) {
        if (userId === newOwnerId) {
          throw new BadRequestError("Cannot transfer ownership to yourself.");
        }
        let newOwner = null;
        if (newOwnerId) {
          newOwner = await getFoodInventoryUserRepository(newOwnerId, inventoryId, false, tx);
        }
        if (!newOwner) {
          newOwner = await getFallbackOwnerRepository(inventoryId, userId, tx);
        }

        await changeRoleFoodInventoryUserWithHistoryRepository(
          newOwner.userId,
          inventoryId,
          "OWNER",
          userId,
          newOwner.role,
          tx,
        );
        const deletedUser = await deleteUserFoodInventoryWithHistoryRepository(
          userId,
          inventoryId,
          userId,
          userRole,
          "MEMBER_LEFT",
          tx,
        );
        return {
          message: "Ownership transferred and previous owner removed successfully.",
          data: deletedUser,
        };
      } else {
        const deletedUser = await deleteUserFoodInventoryWithHistoryRepository(
          userId,
          inventoryId,
          userId,
          userRole,
          "MEMBER_LEFT",
          tx,
        );
        await tx.foodInventory.delete({
          where: { id: inventoryId },
        });
        return {
          message: "Last owner left, inventory and all its data have been deleted.",
          data: deletedUser,
        };
      }
    });
  } catch (error) {
    console.error("Error leaving inventory:", error);
    throw error;
  }
};

//hleda ediotra pokud neni tak usera
export const getFallbackOwnerRepository = async (inventoryId, excludeUserId, tx = prisma) => {
  try {
    const editor = await tx.inventoryUser.findFirst({
      where: {
        inventoryId: inventoryId,
        userId: { not: excludeUserId },
        role: "EDITOR",
      },
    });

    if (editor) return editor;

    return await tx.inventoryUser.findFirst({
      where: {
        inventoryId: inventoryId,
        userId: { not: excludeUserId },
        role: "USER",
      },
    });
  } catch (error) {
    console.error("Error fetching fallback owner:", error);
    throw error;
  }
};

//vraci pocet useru v inventari
export const getInventoryUserCountRepository = async (inventoryId, tx = prisma) => {
  try {
    return await tx.inventoryUser.count({
      where: {
        inventoryId: inventoryId,
      },
    });
  } catch (error) {
    console.error("Error fetching inventory user count:", error);
    throw error;
  }
};

//vrati user podle role
export const getUsersByInventoryIdByRoleRepository = async (inventoryId, rolesToFilter) => {
  try {
    return await prisma.inventoryUser.findMany({
      where: {
        inventoryId: inventoryId,
        ...(rolesToFilter && {
          role: {
            in: Array.isArray(rolesToFilter) ? rolesToFilter : [rolesToFilter],
          },
        }),
      },
      orderBy: [{ user: { username: "asc" } }],
      select: {
        id: true,
        inventoryId: true,
        role: true,
        notificationSettings: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            profilePictureUrl: true,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users by inventory ID:", error);
    throw error;
  }
};

//archivace inventare
export const archiveFoodInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.foodInventory.update({
      where: { id: inventoryId },
      data: { isArchived: true },
    });
  } catch (error) {
    console.error("Error archiving inventory:", error);
    throw error;
  }
};

//zruseni archivace inventare
export const unarchiveFoodInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.foodInventory.update({
      where: { id: inventoryId },
      data: { isArchived: false },
    });
  } catch (error) {
    console.error("Error unarchiving inventory:", error);
    throw error;
  }
};

//update title a label inventare
export const updateFoodInventoryRepository = async (inventoryId, title, icon) => {
  try {
    return await prisma.foodInventory.update({
      where: { id: inventoryId },
      data: {
        title: formatTitleCase(title),
        icon: icon,
      },
    });
  } catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
  }
};

//vrati vsechny inventare pod id usera
export const getAllFoodInventoryRepository = async (userId) => {
  try {
    const inventoryUserRecords = await prisma.inventoryUser.findMany({
      where: { userId: userId },
      select: { inventoryId: true },
    });

    // ziska pole ID inventaru z vysledku prvniho dotazu
    const inventoryIds = inventoryUserRecords.map((record) => record.inventoryId);

    if (inventoryIds.length === 0) {
      return [];
    }
    return await prisma.foodInventory.findMany({
      where: {
        id: { in: inventoryIds },
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        icon: true,
        memberCount: true,
        users: {
          where: { userId: userId },
          select: {
            role: true,
            joinedAt: true,
            notificationSettings: true,
          },
        },
      },
      orderBy: { title: "asc" },
    });
  } catch (error) {
    console.error("Error fetching food inventory:", error);
    throw error;
  }
};

// zmena settingu user v inventari
export const changeSettingFoodInventoryUserRepository = async (
  userId,
  foodInventoryId,
  newSettings,
) => {
  try {
    const existingSettings = await prisma.inventoryUser.findUnique({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
      select: {
        notificationSettings: true,
      },
    });

    // spojeni aktualniho nastaveni s novym
    const updatedSettings = {
      ...existingSettings.notificationSettings,
      ...newSettings,
    };

    return await prisma.inventoryUser.update({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
      data: {
        notificationSettings: updatedSettings,
      },
      select: {
        notificationSettings: true,
        id: true,
        userId: true,
        inventoryId: true,
      },
    });
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
};

// vrati vsechny jidla s kategoriemi, instancemi a labely
export const getInventoryContentRepository = async (inventoryId, userId) => {
  try {
    const content = await prisma.food.findMany({
      where: {
        inventoryId: inventoryId,
        instances: { some: {} },
      },
      include: {
        category: true,
        catalog: {
          include: {
            labels: {
              where: { userId: userId, isDeleted: false },
            },
          },
        },
        variant: true,
        label: true,
        instances: {
          include: { price: true },
          orderBy: [{ expirationDate: "asc" }, { amount: "desc" }, { createdAt: "asc" }],
        },
      },
    });
    return content;
  } catch (error) {
    console.error(`Error fetching inventory content for inventoryId ${inventoryId}:`, error);
    throw error;
  }
};

//vyhleda usery pro pridani do inventare
export const searchUsersForInventoryRepository = async (userId, inventoryId, username, limit) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username,
          mode: "insensitive",
        },
        id: { not: userId },
        NOT: {
          userInventory: {
            some: { inventoryId: parseInt(inventoryId) },
          },
        },
      },
      take: limit,
      select: {
        id: true,
        username: true,
        name: true,
        surname: true,
        profilePictureUrl: true,
        receivedInventoryInvitations: {
          where: {
            inventoryId: parseInt(inventoryId),
            status: "PENDING",
          },
          select: { id: true },
        },
      },
    });
    const mapped = users.map(({ receivedInventoryInvitations, ...user }) => ({
      ...user,
      hasPendingInvitation: receivedInventoryInvitations?.length > 0,
      invitationId: receivedInventoryInvitations?.[0]?.id ?? null,
    }));
    return sortBy(mapped, "username");
  } catch (error) {
    console.error("Error searching users for inventory:", error);
    throw error;
  }
};
