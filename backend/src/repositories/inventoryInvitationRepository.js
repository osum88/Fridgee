import prisma from "../utils/prisma.js";

//vytvori pozvanku do inventare
export const createInventoryInvitationRepository = async (senderId, receiverId, inventoryId) => {
  try {
    return await prisma.inventoryInvitation.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        inventoryId: inventoryId,
        role: "USER",
      },
    });
  } catch (error) {
    console.error("Error creating inventory invitation:", error);
    throw error;
  }
};

//najde pozvanku do inventare
export const getInventoryInvitationRepository = async (senderId, receiverId, inventoryId) => {
  try {
    return await prisma.inventoryInvitation.findUnique({
      where: {
        senderId_receiverId_inventoryId: {
          senderId: senderId,
          receiverId: receiverId,
          inventoryId: inventoryId,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching invitation by Id:", error);
    throw error;
  }
};

//najde pozvanku do inventare
export const getInventoryInvitationByReceiverRepository = async (receiverId, inventoryId) => {
  try {
    return await prisma.inventoryInvitation.findFirst({
      where: {
        receiverId: receiverId,
        inventoryId: inventoryId,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation by receiver and inventory:", error);
    throw error;
  }
};

//odstraneni pozvanky
export const deleteInventoryInvitationRepository = async (invitationId) => {
  try {
    return await prisma.inventoryInvitation.delete({
      where: {
        id: invitationId,
      },
    });
  } catch (error) {
    console.error("Error deleting invitation by Id:", error);
    throw error;
  }
};

//smaze vsechny pozvanky podle prijmece a invenatare
export const deleteInventoryInvitationsByReceiverRepository = async (receiverId, inventoryId) => {
  try {
    return await prisma.inventoryInvitation.deleteMany({
      where: {
        receiverId: receiverId,
        inventoryId: inventoryId,
      },
    });
  } catch (error) {
    console.error("Error deleting invitations by receiver and inventory:", error);
    throw error;
  }
};

//najde pozvanku do inventare pro prijmence
export const getInvitationByIdRepository = async (invitationId) => {
  try {
    return await prisma.inventoryInvitation.findUnique({
      where: {
        id: invitationId,
      },
    });
  } catch (error) {
    console.error("Error fetching invitation for receiver:", error);
    throw error;
  }
};

//vrati vsechny pozvanky pro usera
export const getInventoryInvitationsByUserRepository = async (userId) => {
  try {
    const invitations = await prisma.inventoryInvitation.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            profilePictureUrl: true,
          },
        },
        inventory: {
          select: { id: true, title: true },
        },
      },
    });

    return invitations.map(({ sender, inventory, ...invitation }) => ({
      ...invitation,
      inventoryId: inventory.id,
      inventoryTitle: inventory.title,
      senderId: sender.id,
      senderUsername: sender.username,
      senderName: sender.name,
      senderSurname: sender.surname,
      senderProfilePictureUrl: sender.profilePictureUrl,
    }));
  } catch (error) {
    console.error("Error fetching inventory invitations by user:", error);
    throw error;
  }
};
