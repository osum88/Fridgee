import { BadRequestError, ConflictError, ForbiddenError, InternalServerError, NotFoundError } from "../errors/errors.js";
import { createInventoryUserRepository, getFoodInventoryRepository, getFoodInventoryUserRepository, getFoodInventoryUserRoleRepository } from "../repositories/foodInventoryRepository.js";
import { createInventoryInvitationRepository, deleteInventoryInvitationRepository, getInventoryInvitationRepository, getInvitationByIdRepository } from "../repositories/inventoryInvitationRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";

//odesle zadost do inventare
export const sendInventoryInvitationService = async (senderId, receiverId, inventoryId, role) => {
    
    if (isNaN(inventoryId)) {
        throw new BadRequestError("Invalid inventory ID provided.");
    }
    if (isNaN(receiverId)) {
        throw new BadRequestError("Invalid receiver ID provided.");
    }
    if (senderId === receiverId) {
        throw new BadRequestError("You cannot sent invitation yourself.");
    }
    await getUserByIdRepository(receiverId);
    await getFoodInventoryRepository(inventoryId);

    //kontrola role odesilatele
    const senderRole = await getFoodInventoryUserRoleRepository(senderId, inventoryId);
    if (senderRole.role !== "OWNER" && senderRole.role !== "EDITOR") {
        throw new ForbiddenError("You do not have permission to send invitations to this inventory.");
    }

    // kontrola, zda uživatel již v inventari neni
    const existingInventoryUser = await getFoodInventoryUserRepository(receiverId, inventoryId, false);
    if (existingInventoryUser) {
        throw new ConflictError("User is already in this inventory.");
    }

    // kontrola, zda uz existuje cekajici pozvanka
    const existingInvitation = await getInventoryInvitationRepository(senderId, receiverId, inventoryId);
    if (existingInvitation) {
        await deleteInventoryInvitationRepository(existingInvitation.id);
    }

    // vytvoreni noveho zaznamu
    const newInventoryInvitation = await createInventoryInvitationRepository(senderId, receiverId, inventoryId, role);
    if (!newInventoryInvitation) {
        throw new InternalServerError("Failed sent inventory invitation.");
    }
    
    return newInventoryInvitation;
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
    const existingInventoryUser = await getFoodInventoryUserRepository(receiverId, invitation.inventoryId, false);
    if (existingInventoryUser) {
        await deleteInventoryInvitationRepository(invitationId);
        throw new ConflictError("User is already in this inventory.");
    }

    // vytvoreni noveho zaznamu
    const newInventoryUser = await createInventoryUserRepository(receiverId, invitation.inventoryId, invitation.role);
    if (!newInventoryUser) {
        throw new InternalServerError("Failed to accept inventory invitation.");
    }
    await deleteInventoryInvitationRepository(invitationId);
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
    await deleteInventoryInvitationRepository(invitationId);
    return true;
};
