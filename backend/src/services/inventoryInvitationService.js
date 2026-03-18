import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../errors/errors.js";
import {
  createInventoryUserRepository,
  getFoodInventoryRepository,
  getFoodInventoryUserRepository,
  getFoodInventoryUserRoleRepository,
} from "../repositories/foodInventoryRepository.js";
import {
  createInventoryInvitationRepository,
  deleteInventoryInvitationRepository,
  deleteInventoryInvitationsByReceiverRepository,
  getInventoryInvitationByReceiverRepository,
  getInventoryInvitationRepository,
  getInventoryInvitationsByUserRepository,
  getInvitationByIdRepository,
} from "../repositories/inventoryInvitationRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";

//odesle zadost a pokud existuje tak ji zrusi do inventare
export const sendInventoryInvitationService = async (senderId, receiverId, inventoryId) => {
  if (senderId === receiverId) {
    throw new BadRequestError("You cannot sent invitation yourself.");
  }
  await getUserByIdRepository(receiverId);
  await getFoodInventoryRepository(inventoryId);

  //kontrola role odesilatele
  const senderRole = await getFoodInventoryUserRoleRepository(senderId, inventoryId);
  if (senderRole?.role !== "OWNER" && senderRole?.role !== "EDITOR") {
    throw new ForbiddenError("You do not have permission to send invitations to this inventory.");
  }

  // kontrola, zda uživatel již v inventari neni
  const existingInventoryUser = await getFoodInventoryUserRepository(
    receiverId,
    inventoryId,
    false,
  );
  if (existingInventoryUser) {
    console.error("User is already in this inventory.");
    return false;
  }

  // kontrola, zda uz existuje cekajici pozvanka
  const existingInvitation = await getInventoryInvitationByReceiverRepository(
    receiverId,
    inventoryId,
  );
  if (existingInvitation) {
    return await deleteInventoryInvitationsByReceiverRepository(receiverId, inventoryId);
  }
  // vytvoreni noveho zaznamu
  return await createInventoryInvitationRepository(senderId, receiverId, inventoryId);
};

//akceptuje pozvanku do inventare
export const acceptInventoryInvitationService = async (receiverId, invitationId) => {
  const invitation = await getInvitationByIdRepository(invitationId);
  if (!invitation) {
    throw new NotFoundError("Invitation not found or has expired.");
  }

  // kontrola ze pozvanku prijima spravny uzivatel
  if (invitation.receiverId !== receiverId) {
    throw new ForbiddenError("You are not authorized to accept this invitation.");
  }

  await getFoodInventoryRepository(invitation.inventoryId);

  // kontrola, zda uživatel již v inventari neni
  const existingInventoryUser = await getFoodInventoryUserRepository(
    receiverId,
    invitation.inventoryId,
    false,
  );
  if (existingInventoryUser) {
    await deleteInventoryInvitationsByReceiverRepository(receiverId, invitation?.inventoryId);
    throw new ConflictError("User is already in this inventory.");
  }

  // vytvoreni noveho zaznamu
  const newInventoryUser = await createInventoryUserRepository(
    receiverId,
    invitation
  );
  if (!newInventoryUser) {
    throw new InternalServerError("Failed to accept inventory invitation.");
  }
  await deleteInventoryInvitationsByReceiverRepository(receiverId, invitation?.inventoryId);
  return newInventoryUser;
};

//odmitne zadost do inventare
export const rejectInventoryInvitationService = async (receiverId, invitationId) => {
  const invitation = await getInvitationByIdRepository(invitationId);
  if (!invitation) {
    throw new NotFoundError("Invitation not found or has expired.");
  }

  // kontrola ze pozvanku prijima spravny uzivatel
  if (invitation.receiverId !== receiverId) {
    throw new ForbiddenError("You are not authorized to reject this invitation.");
  }
  await deleteInventoryInvitationsByReceiverRepository(receiverId, invitation?.inventoryId);
  return true;
};

//vrati vsechny pozvanky pro usera
export const getInventoryInvitationsByUserService = async (userId) => {
  return await getInventoryInvitationsByUserRepository(userId);
};
