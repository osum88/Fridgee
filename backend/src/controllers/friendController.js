import { createFriendshipService, deleteFriendshipService, getAllFriendService, getFriendshipService, getReceivedFriendRequestsService, getSentFriendRequestsService, updateFriendshipStatusService } from "../models/friendModel.js";
import { getUserByIdService } from "../models/userModel.js";
import getFriendshipUserIds from "../utils/friendshipUtils.js";
import handleResponse from "../utils/responseHandler.js";

export const addFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;

        if (user1 === user2) {
            return handleResponse(res, 400, "You cannot add yourself as a friend");
        }

        //pokud user2 uz o pratelstvi pozadal, ale user1 to ignoroval, ale neodmitl, a user1 zada o prateltvi, pak toto rovnou akceptuje zadost
        const friendship = await getFriendshipService(user1, user2);
        if (friendship) {
            if (friendship.status === "PENDING" && friendship.receiverId === currentId) {
                const acceptedFriendship = await updateFriendshipStatusService(friendship.senderId, friendship.receiverId, "ACCEPTED");
                return handleResponse(res, 200, "Friendship accepted successfully.", acceptedFriendship);
            }
            return handleResponse(res, 409, "Friendship already exists or request is pending.");
        }
        const newFriendship = await createFriendshipService(user1, user2);
        return handleResponse(res, 200, "Friend request sent successfully.", newFriendship);
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
        const friendship = await getFriendshipService(user1, user2);
        
        if (!friendship) {
            return handleResponse(res, 404, "Friendship not found");
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

export const cancelRequestFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;
        const isAdmin = req.user.isAdmin;

        const friendship = await getFriendshipService(user1, user2);
        if (!friendship) {
            return handleResponse(res, 404, "Friendship request not found");
        }

        if (friendship.senderId !== currentId && !isAdmin) {
            return handleResponse(res, 403, "Access denied. You can only cancel requests sent by you");
        }

        if (friendship.status == "PENDING") {
            const deletedFriendship = await deleteFriendshipService(friendship.senderId, friendship.receiverId);
            return handleResponse(res, 200, "Friendship request cancelled successfully", deletedFriendship);
        }    
        return handleResponse(res, 400, "There is no pending friendship request to cancel");
    } catch (err) {
        next(err);
    }
};

export const getAllFriend = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a user ID is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }

            const user = await getUserByIdService(userId);
            if (!user) {
                return handleResponse(res, 404, "User not found.");
            }
        } else {
            userId = req.user.id;
        }
        const allFriend = await getAllFriendService(userId);

        return handleResponse(res, 200, "Friends fetched successfully", allFriend);
    } catch (err) {
        next(err);
    }
};

export const getSentFriendRequests = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a user ID is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }

            const user = await getUserByIdService(userId);
            if (!user) {
                return handleResponse(res, 404, "User not found.");
            }
        } else {
            userId = req.user.id;
        }
        const sentRequests = await getSentFriendRequestsService(userId);

        return handleResponse(res, 200, "Sent requests fetched successfully", sentRequests);
    } catch (err) {
        next(err);
    }
};

export const getReceivedFriendRequests = async (req, res, next) => {
    try {
        const isAdmin = req.user.isAdmin;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a user ID is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }

            const user = await getUserByIdService(userId);
            if (!user) {
                return handleResponse(res, 404, "User not found.");
            }
        } else {
            userId = req.user.id;
        }
        const receivedRequests = await getReceivedFriendRequestsService(userId);

        return handleResponse(res, 200, "Received requests fetched successfully", receivedRequests);
    } catch (err) {
        next(err);
    }
};

