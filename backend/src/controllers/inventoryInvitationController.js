import { acceptInventoryInvitationService, rejectInventoryInvitationService, sendInventoryInvitationService } from "../services/inventoryInvitationService.js";
import handleResponse from "../utils/responseHandler.js";


//odesle pozvanky do inventare
export const sendInventoryInvitation = async (req, res, next) => {
    try {
        const inventoryId = parseInt(req.params.inventoryId, 10);
        const { receiverId, role } = req.body;
        const senderId = req.userId;
     
        const newInventoryInvitation = await sendInventoryInvitationService(senderId, receiverId, inventoryId, role);
        handleResponse(res, 201, "Invitation to inventory sent successfully", newInventoryInvitation);
    }
    catch(err){
        next(err);
    }
};

//potvrzeni pozvanku do inventare
export const acceptInventoryInvitation = async (req, res, next) => {
    try {
        const invitationId = parseInt(req.params.invitationId, 10);
        const receiverId = req.userId;
     
        const accepInventoryInvitation = await acceptInventoryInvitationService(receiverId, invitationId);
        handleResponse(res, 201, "Invitation accepted successfully", accepInventoryInvitation);
    }
    catch(err){
        next(err);
    }
};

//odmitnuti pozvanky do inventare
export const rejectInventoryInvitation = async (req, res, next) => {
    try {
        const invitationId = parseInt(req.params.invitationId, 10);
        const receiverId = req.userId;
     
        const rejectInventoryInvitation = await rejectInventoryInvitationService(receiverId, invitationId);
        handleResponse(res, 201, "Invitation rejected successfully", rejectInventoryInvitation);
    }
    catch(err){
        next(err);
    }
};