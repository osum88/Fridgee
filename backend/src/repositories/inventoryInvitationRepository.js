import prisma from "../utils/prisma.js";

//vytvori pozvanku do inventare
export const createInventoryInvitationRepository = async (
  senderId,
  receiverId,
  inventoryId,
  role,
) => {
  try {
    return await prisma.inventoryInvitation.create({
      data: {
        senderId: senderId,
        receiverId: receiverId,
        inventoryId: inventoryId,
        role: role,
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
    console.error("Error fetching invitation by Ids:", error);
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
