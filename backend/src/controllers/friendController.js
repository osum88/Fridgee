import { createFriendshipService, deleteFriendshipService, getFriendshipService, updateFriendshipStatusService } from "../models/friendModel.js";
import getFriendshipUserIds from "../utils/friendshipUtils.js";
import handleResponse from "../utils/responseHandler.js";

export const addFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);

        if (user1 === user2) {
            return handleResponse(res, 400, "You cannot add yourself as a friend");
        }
        const friendship = await createFriendshipService(user1, user2);
        handleResponse(res, 200, "Friend request sent successfully", friendship);
    }
    catch(err){
        next(err);
    }
};

export const deleteFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        
        if (user1 === user2) {
            return handleResponse(res, 400, "You cannot remove yourself from friends.");
        }
        const deletedFriendship = await deleteFriendshipService(user1, user2);
        
        return handleResponse(res, 200, "Friendship removed successfully", deletedFriendship);
        
    } catch (err) {
        next(err);
    }
};

export const acceptFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;
        const isAdmin = req.user.isAdmin;

        const friendship = await getFriendshipService(user1, user2);
        if (!friendship) {
            return handleResponse(res, 403, "Friendship doesns't exist");
        }

        if (friendship.receiverId !== currentId && !isAdmin) {
            return handleResponse(res, 403, "Access denied. You can only accept requests sent to you.");
        }

        if (friendship.status == "PENDING") {
            const acceptedFriendship = await updateFriendshipStatusService(friendship.senderId, friendship.receiverId, "ACCEPTED");
            return handleResponse(res, 200, "Friendship accepted successfully", acceptedFriendship);
        }    
        return handleResponse(res, 400, "There is no pending friendship request to accept");
    } catch (err) {
        next(err);
    }
};

export const blockFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;
        const isAdmin = req.user.isAdmin;

        const friendship = await getFriendshipService(user1, user2);
        if (!friendship) {
            return handleResponse(res, 403, "Friendship doesns't exist");
        }

        if (friendship.receiverId !== currentId && !isAdmin) {
            return handleResponse(res, 403, "Access denied. You can only accept requests sent to you.");
        }

        if (friendship.status == "PENDING") {
            const acceptedFriendship = await updateFriendshipStatusService(friendship.senderId, friendship.receiverId, "ACCEPTED");
            return handleResponse(res, 200, "Friendship accepted successfully", acceptedFriendship);
        }    
        return handleResponse(res, 400, "There is no pending friendship request to accept");
    } catch (err) {
        next(err);
    }
};