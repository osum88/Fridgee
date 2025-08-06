import { createFriendshipRepository, deleteFriendshipRepository, getAllFriendRepository, getFriendshipRepository, getReceivedFriendRequestsRepository, getSentFriendRequestsRepository, updateFriendshipStatusRepository } from "../repositories/friendRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";
import getFriendshipUserIds from "../utils/friendshipUtils.js";
import handleResponse from "../utils/responseHandler.js";

//pridani do pratel oba users mohou poslat zadost i admin
export const addFriend = async (req, res, next) => {
    try {
        const isAdmin = req.adminRoute;
        let user1Id, user2Id;

        if (isAdmin) {                          //pro adminy
            user1Id = parseInt(req.params.id, 10);
            user2Id = req.body.user2Id;
   
            if (!user1Id || !user2Id) {
                throw new Error("For admin, both user1Id and user2Id are required.");
            }
        
            if (isNaN(user1Id) || isNaN(user2Id)) {
                throw new Error("User IDs must be numbers.");
            }
            await getUserByIdRepository(user1Id);
            await getUserByIdRepository(user2Id);

        } else {                    //pro bezne uzivatele
            user1Id = req.user.id;
            user2Id = req.body.user2Id;
        
            if (isNaN(user2Id)) {
                throw new Error("Invalid friend ID provided.");
            }
            await getUserByIdRepository(user2Id);
        }
        
        if (user1Id === user2Id) {
            return handleResponse(res, 400, "You cannot add yourself as a friend");
        }

        //pokud user2 uz o pratelstvi pozadal, ale user1 to ignoroval, ale neodmitl, a user1 zada o prateltvi, pak toto rovnou akceptuje zadost
        const friendship = await getFriendshipRepository(user1Id, user2Id);
        if (friendship) {
            if (friendship.status === "PENDING" && friendship.receiverId === user1Id) {
                const acceptedFriendship = await updateFriendshipStatusRepository(friendship.senderId, friendship.receiverId, "ACCEPTED");
                return handleResponse(res, 200, "Friendship accepted successfully.", acceptedFriendship);
            }
            return handleResponse(res, 409, "Friendship already exists or request is pending.");
        }
        const newFriendship = await createFriendshipRepository(user1Id, user2Id);
        return handleResponse(res, 200, "Friend request sent successfully.", newFriendship);
    }
    catch(err){
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//smazani pratelstvi oba user mohou zrusit i admin
export const deleteFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const isAdmin = req.adminRoute;

        if (isAdmin){
            await getUserByIdRepository(user1);
            await getUserByIdRepository(user2);
        }
        else {
            await getUserByIdRepository(user2);
        }
        
        if (user1 === user2) {
            return handleResponse(res, 400, "You cannot remove yourself from friends.");
        }
        const friendship = await getFriendshipRepository(user1, user2);
        
        if (!friendship) {
            return handleResponse(res, 404, "Friendship not found");
        }
        const deletedFriendship = await deleteFriendshipRepository(user1, user2);
        
        return handleResponse(res, 200, "Friendship removed successfully", deletedFriendship);
        
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//prijmuti zadosti pokud je ve stavu pendding, muze akceptovat jen ten kdo ho obdrzel, admin muze zrusit z user1 i user2
export const acceptFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;
        const isAdmin = req.adminRoute;

        if (isAdmin){
            await getUserByIdRepository(user1);
            await getUserByIdRepository(user2);
        }
        else {
            await getUserByIdRepository(user2);
        }

        const friendship = await getFriendshipRepository(user1, user2);
        if (!friendship) {
            return handleResponse(res, 403, "Friendship does not exist");
        }

        if (friendship.receiverId !== currentId && !isAdmin) {
            return handleResponse(res, 403, "Access denied. You can only accept requests sent to you.");
        }

        if (friendship.status == "PENDING") {
            const acceptedFriendship = await updateFriendshipStatusRepository(friendship.senderId, friendship.receiverId, "ACCEPTED");
            return handleResponse(res, 200, "Friendship accepted successfully", acceptedFriendship);
        }    
        return handleResponse(res, 400, "There is no pending friendship request to accept");
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//zruseni zadosti pokud je ve stavu pendding, muze zrusit jen ten kdo ho poslal, admin muze zrusit z user1 i user2
export const cancelRequestFriend = async (req, res, next) => {
    try {
        const { user1, user2 } = getFriendshipUserIds(req);
        const currentId = req.user.id;
        const isAdmin = req.adminRoute;

        if (isAdmin){
            await getUserByIdRepository(user1);
            await getUserByIdRepository(user2);
        }
        else {
            await getUserByIdRepository(user2);
        }

        const friendship = await getFriendshipRepository(user1, user2);
        if (!friendship) {
            return handleResponse(res, 404, "Friendship request not found");
        }

        if (friendship.senderId !== currentId && !isAdmin) {
            return handleResponse(res, 403, "Access denied. You can only cancel requests sent by you");
        }

        if (friendship.status == "PENDING") {
            const deletedFriendship = await deleteFriendshipRepository(friendship.senderId, friendship.receiverId);
            return handleResponse(res, 200, "Friendship request cancelled successfully", deletedFriendship);
        }    
        return handleResponse(res, 400, "There is no pending friendship request to cancel");
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//seznam vsech pratel
export const getAllFriend = async (req, res, next) => {
    try {
        const isAdmin = req.adminRoute;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
            await getUserByIdRepository(userId);

        } else {
            userId = req.user.id;
        }
        const allFriend = await getAllFriendRepository(userId);

        return handleResponse(res, 200, "Friends fetched successfully", allFriend);
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//seznam vsech odeslanych zadosti
export const getSentFriendRequests = async (req, res, next) => {
    try {
        const isAdmin = req.adminRoute;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
            await getUserByIdRepository(userId);

        } else {
            userId = req.user.id;
        }
        const sentRequests = await getSentFriendRequestsRepository(userId);

        return handleResponse(res, 200, "Sent requests fetched successfully", sentRequests);
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

//seznam vsech obdrzenych zadosti
export const getReceivedFriendRequests = async (req, res, next) => {
    try {
        const isAdmin = req.adminRoute;
        let userId;

        if (isAdmin) {
            userId = parseInt(req.params.id, 10);
            
            if (!userId) {
                return handleResponse(res, 400, "For admin, a userId is required.");
            }

            if (isNaN(userId)) {
                return handleResponse(res, 400, "Invalid user ID provided.");
            }
            await getUserByIdRepository(userId);
        } else {
            userId = req.user.id;
        }
        const receivedRequests = await getReceivedFriendRequestsRepository(userId);

        return handleResponse(res, 200, "Received requests fetched successfully", receivedRequests);
    } catch (err) {
        if (err.message === "UserNotFound") {
            return handleResponse(res, 404, "User not found.");
        }
        next(err);
    }
};

