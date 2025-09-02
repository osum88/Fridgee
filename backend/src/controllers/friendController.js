import { console } from "inspector";
import { acceptFriendService, addFriendService, cancelRequestFriendService, deleteFriendService,  getAllFriendsService, getReceivedFriendRequestsService, getSentFriendRequestsService } from "../services/friendService.js";
import handleResponse from "../utils/responseHandler.js";

//pridani do pratel oba users mohou poslat zadost i admin
export const addFriend = async (req, res, next) => {
    try {
        const user1Id = req.userId;
        const user2Id = req.body.user2Id;
        const isAdmin = req.adminRoute;
     
        const friendship = await addFriendService(user1Id, user2Id, isAdmin);
    
        if (friendship.status === "ACCEPTED") {
            return handleResponse(res, 200, "Friendship accepted successfully.", friendship);
        } else {
            return handleResponse(res, 200, "Friend request sent successfully.", friendship);
        }
    }
    catch(err){
        next(err);
    }
};

//smazani pratelstvi oba user mohou zrusit i admin
export const deleteFriend = async (req, res, next) => {
    try {
        const user1Id = req.userId;
        const user2Id = parseInt(req.params.friendId, 10);
        const isAdmin = req.adminRoute;
        
        const deletedFriendship = await deleteFriendService(user1Id, user2Id, isAdmin);
        
        return handleResponse(res, 200, "Friendship removed successfully", deletedFriendship);
    } catch (err) {
        next(err);
    }
};

//prijmuti zadosti pokud je ve stavu pendding, muze akceptovat jen ten kdo ho obdrzel, admin muze zrusit z user1 i user2
export const acceptFriend = async (req, res, next) => {
    try {
        const user1Id = req.userId;
        const user2Id = parseInt(req.params.friendId, 10);
        const isAdmin = req.adminRoute;
        
        const acceptedFriendship = await acceptFriendService(user1Id, user2Id, isAdmin);
        
        return handleResponse(res, 200, "Friendship accepted successfully", acceptedFriendship);
    } catch (err) {
        next(err);
    }
};

//zruseni zadosti pokud je ve stavu pendding, muze zrusit jen ten kdo ho poslal, admin muze zrusit z user1 i user2
export const cancelRequestFriend = async (req, res, next) => {
    try {
        const user1Id = req.userId;
        const user2Id = parseInt(req.params.friendId, 10);
        const isAdmin = req.adminRoute;
        
        const deletedFriendship = await cancelRequestFriendService(user1Id, user2Id, isAdmin);
        
        return handleResponse(res, 200, "Friendship request cancelled successfully", deletedFriendship);
    } catch (err) {
        next(err);
    }
};

//seznam vsech pratel
export const getAllFriends = async (req, res, next) => {
    try {
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const allFriends = await getAllFriendsService(userId, isAdmin);
        
        return handleResponse(res, 200, "Friends fetched successfully", allFriends);
    } catch (err) {
        next(err);
    }
};

//seznam vsech odeslanych zadosti
export const getSentFriendRequests = async (req, res, next) => {
    try {
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const sentRequests = await getSentFriendRequestsService(userId, isAdmin);

        return handleResponse(res, 200, "Sent requests fetched successfully", sentRequests);
    } catch (err) {
        next(err);
    }
};

//seznam vsech obdrzenych zadosti
export const getReceivedFriendRequests = async (req, res, next) => {
    try {
        const userId = req.userId;
        const isAdmin = req.adminRoute;

        const receivedRequests = await getReceivedFriendRequestsService(userId, isAdmin);

        return handleResponse(res, 200, "Received requests fetched successfully", receivedRequests);
    } catch (err) {
        next(err);
    }
};

