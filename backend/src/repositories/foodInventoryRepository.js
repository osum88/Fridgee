import { ConflictError, NotFoundError } from "../errors/errors.js";
import { convertPrice } from "../services/priceService.js";
import prisma from "../utils/prisma.js";

//vytvari inventar jidla s prvnim jeho uzivatelem (owner)
export const createFoodInventoryRepository = async (userId, title, label) => {
  try {
    return await prisma.foodInventory.create({
      data: {
        title: title,
        label: label,
        memberCount: 1,
        inventory: {
          create: {
            userId: userId,
            role: "OWNER",
          },
        },
      },
      include: {
        inventory: true,
      },
    });
  } catch (error) {
    console.error("Error creating food inventory:", error);
    throw error;
  }
};

// vytvori usera food inventare
export const createInventoryUserRepository = async (userId, foodInventoryId, role) => {
  try {
    const [newInventoryUser, updatedFoodInventory] = await prisma.$transaction([
      prisma.inventoryUser.create({
        data: {
          userId: userId,
          inventoryId: foodInventoryId,
          role: role,
        },
      }),
      prisma.foodInventory.update({
        where: {
          id: foodInventoryId,
        },
        data: {
          memberCount: {
            increment: 1,
          },
        },
      }),
    ]);
    return { newInventoryUser, updatedFoodInventory };
  } catch (error) {
    console.error("Error creating new inventory user:", error);
    throw error;
  }
};

// ziskani inventare podle id
export const getFoodInventoryRepository = async (foodInventoryId) => {
  try {
    const foodInventory = await prisma.foodInventory.findUnique({
      where: {
        id: foodInventoryId,
      },
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
) => {
  try {
    const user = await prisma.inventoryUser.findUnique({
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
export const changeRoleFoodInventoryUserRepository = async (userId, foodInventoryId, role) => {
  try {
    return await prisma.inventoryUser.update({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: foodInventoryId,
        },
      },
      data: {
        role: role,
      },
    });
  } catch (error) {
    console.error("Error updating user role:", error);
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
      select: {
        role: true,
      },
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

//vrati pocet owneru
export const getFoodInventoryOwnerCountRepository = async (inventoryId) => {
  try {
    return await prisma.inventoryUser.count({
      where: {
        inventoryId: inventoryId,
        role: "OWNER",
      },
    });
  } catch (error) {
    console.error("Error fetching inventory owner count:", error);
    throw error;
  }
};

//smaze uzivatele inventare
export const deleteUserFoodInventoryRepository = async (userId, inventoryId) => {
  try {
    const [deletedUser, updatedFoodInventory] = await prisma.$transaction([
      prisma.inventoryUser.delete({
        where: {
          userId_inventoryId: {
            userId: userId,
            inventoryId: inventoryId,
          },
        },
      }),
      prisma.foodInventory.update({
        where: {
          id: inventoryId,
        },
        data: {
          memberCount: {
            decrement: 1,
          },
        },
      }),
    ]);
    return { deletedUser, updatedFoodInventory };
  } catch (error) {
    console.error("Error deleting user in inventory:", error);
    throw error;
  }
};

//smaze inventar
export const deleteFoodInventoryRepository = async (inventoryId) => {
  try {
    return await prisma.foodInventory.delete({
      where: {
        id: inventoryId,
      },
    });
  } catch (error) {
    console.error("Error deleting food inventory:", error);
    throw error;
  }
};

//vrati user podle role
export const getUsersByInventoryIdRepository = async (inventoryId, rolesToFilter) => {
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
      orderBy: [
        { user: { name: "asc" } },
        { user: { surname: "asc" } },
        { user: { username: "asc" } },
      ],
      select: {
        id: true,
        userId: true,
        inventoryId: true,
        role: true,
        notificationSettings: true,
        user: {
          select: {
            id: true,
            name: true,
            surname: true,
            username: true,
            birthDate: true,
            email: true,
            profilePictureUrl: true,
            preferredLanguage: true,
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
      where: {
        id: inventoryId,
      },
      data: {
        isArchived: true,
      },
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
      where: {
        id: inventoryId,
      },
      data: {
        isArchived: false,
      },
    });
  } catch (error) {
    console.error("Error unarchiving inventory:", error);
    throw error;
  }
};

//update title a label inventare
export const updateFoodInventoryRepository = async (inventoryId, title, label) => {
  try {
    return await prisma.foodInventory.update({
      where: {
        id: inventoryId,
      },
      data: {
        title: title,
        label: label,
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
      where: {
        userId: userId,
      },
      select: {
        inventoryId: true,
      },
    });

    // ziska pole ID inventaru z vysledku prvniho dotazu
    const inventoryIds = inventoryUserRecords.map((record) => record.inventoryId);

    if (inventoryIds.length === 0) {
      return [];
    }
    return await prisma.foodInventory.findMany({
      where: {
        id: {
          in: inventoryIds,
        },
        isArchived: false,
      },
      select: {
        id: true,
        title: true,
        label: true,
        memberCount: true,
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
    const inventoryContent = await prisma.inventoryUser.findUnique({
      where: {
        userId_inventoryId: {
          userId: userId,
          inventoryId: inventoryId,
        },
      },
      select: {
        role: true,
        joinedAt: true,
        notificationSettings: true,
        inventory: {
          select: {
            title: true,
            label: true,
            memberCount: true,
          },
        },
      },
    });
    const { inventory, ...restInventory } = inventoryContent;
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
          orderBy: { expirationDate: "asc" },
        },
      },
    });
    return { inventory: { ...inventory, ...restInventory }, content };
  } catch (error) {
    console.error(`Error fetching inventory content for inventoryId ${inventoryId}:`, error);
    throw error;
  }
};
