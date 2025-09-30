import { BadRequestError, ConflictError, NotFoundError } from "../errors/errors.js";
import { createFriendshipRepository, deleteFriendshipRepository, getFriendshipRepository, updateFriendshipStatusRepository, getAllFriendsRepository, getSentFriendRequestsRepository, getReceivedFriendRequestsRepository } from "../repositories/friendRepository.js";
import { getUserByIdRepository } from "../repositories/userRepository.js";

export const addFriendService = async (user1Id, user2Id, isAdmin) => {
    // validace user2id
    if (!user2Id) {
        throw new BadRequestError("User2Id is required.");
    }
    if (isNaN(user2Id)) {
        throw new BadRequestError("Invalid friend ID provided.");
    }
    if (user1Id === user2Id) {
        throw new BadRequestError("You cannot add yourself as a friend.");
    }
    
    // overeni existence obou uzivatelu
    if (isAdmin){
        await getUserByIdRepository(user1Id);
    }
    await getUserByIdRepository(user2Id);
    
    //pokud user2 uz o pratelstvi pozadal, ale user1 to ignoroval, ale neodmitl, a user1 zada o prateltvi, pak toto rovnou akceptuje zadost
    const existingFriendship = await getFriendshipRepository(user1Id, user2Id);
    if (existingFriendship) {
        if (existingFriendship.status === "PENDING" && existingFriendship.receiverId === user1Id) {
            const acceptedFriendship = await updateFriendshipStatusRepository(existingFriendship.senderId, existingFriendship.receiverId, "ACCEPTED");
            return acceptedFriendship;
        }
        throw new ConflictError("Friendship already exists or request is pending.");
    }
    
    // nova zadost
    const newFriendship = await createFriendshipRepository(user1Id, user2Id);
    
    return newFriendship;
};

//smaze pratesltvi
export const deleteFriendService = async (user1Id, user2Id, isAdmin) => {
    // validace user2id
    if (!user2Id) {
        throw new BadRequestError("User2Id is required.");
    }
    if (isNaN(user2Id)) {
        throw new BadRequestError("Invalid friend ID provided.");
    }
    if (user1Id === user2Id) {
        throw new BadRequestError("You cannot add yourself as a friend.");
    }
    
    // overeni existence obou uzivatelu
    if (isAdmin){
        await getUserByIdRepository(user1Id);
    }
    await getUserByIdRepository(user2Id);
    
    // kontrola existence pratelstvi
    const friendship = await getFriendshipRepository(user1Id, user2Id);
    if (!friendship) {
        throw new NotFoundError("Friendship not found.");
    }

    // smazani pratelstvi
    const deletedFriendship = await deleteFriendshipRepository(user1Id, user2Id);
    return deletedFriendship;
};

//akceptuje zadost o pratelstvi PENDING -> ACCEPT
export const acceptFriendService = async (user1Id, user2Id, isAdmin) => {
    // validace user2id
    if (!user2Id) {
        throw new BadRequestError("User2Id is required.");
    }
    if (isNaN(user2Id)) {
        throw new BadRequestError("Invalid friend ID provided.");
    }
    if (user1Id === user2Id) {
        throw new BadRequestError("You cannot add yourself as a friend.");
    }
    
    // overeni existence obou uzivatelu
    if (isAdmin){
        await getUserByIdRepository(user1Id);
    }
    await getUserByIdRepository(user2Id);
    
    // kontrola existence pratelstvi
    const friendship = await getFriendshipRepository(user2Id, user1Id); // Zde je user2Id odesílatel
    if (!friendship) {
        throw new NotFoundError("Friendship request not found.");
    }

    // prijmout muze pouze ten kdo ji obdrzel nebo admin
    if (friendship.receiverId !== user1Id && !isAdmin) {
        return ConflictError("Access denied. You can only accept requests sent to you.");
    }

    // akceptace pratelstvi
    if (friendship.status == "PENDING") {
        const acceptedFriendship = await updateFriendshipStatusRepository(friendship.senderId, friendship.receiverId, "ACCEPTED");
        return acceptedFriendship;
    }
    throw new BadRequestError("There is no pending friendship request to accept.");
};

//odmitne zadost 
export const cancelRequestFriendService = async (user1Id, user2Id, isAdmin) => {
    // validace user2id
    if (!user2Id) {
        throw new BadRequestError("User2Id is required.");
    }
    if (isNaN(user2Id)) {
        throw new BadRequestError("Invalid friend ID provided.");
    }
    if (user1Id === user2Id) {
        throw new BadRequestError("You cannot add yourself as a friend.");
    }
    
    // overeni existence obou uzivatelu
    if (isAdmin){
        await getUserByIdRepository(user1Id);
    }
    await getUserByIdRepository(user2Id);
    
    // kontrola existence pratelstvi
    const friendship = await getFriendshipRepository(user2Id, user1Id); // Zde je user2Id odesílatel
    if (!friendship) {
        throw new NotFoundError("Friendship request not found.");
    }

    // prijmout muze pouze ten kdo ji obdrzel nebo admin
    if (friendship.senderId !== user1Id && !isAdmin) {
        return ConflictError("Access denied. You can only accept requests sent to you.");
    }

    // akceptace pratelstvi
    if (friendship.status == "PENDING") {
        const deletedFriendship = await deleteFriendshipRepository(friendship.senderId, friendship.receiverId);
        return deletedFriendship;
    }
    throw new BadRequestError("There is no pending friendship request to cancel");
};

//vyhleda pratele
export const getAllFriendsService = async (userId, username, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId);
    } 

    let sanitizedUsername
    if (username) {
        sanitizedUsername = username.trim().replace(/\s+/g, "").toLowerCase();
    } else {
        sanitizedUsername = "";
    }
    

    const allFriends = await getAllFriendsRepository(userId, sanitizedUsername);
    
    return allFriends;
};

//vyhleda vsechny odeslane zadosti
export const getSentFriendRequestsService = async (userId, username, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId);
    } 

    let sanitizedUsername
    if (username) {
        sanitizedUsername = username.trim().replace(/\s+/g, "").toLowerCase();
    } else {
        sanitizedUsername = "";
    }

    const sentRequests = await getSentFriendRequestsRepository(userId, sanitizedUsername);
    
    return sentRequests;
};

//vyhleda vsechny prijate zadosti
export const getReceivedFriendRequestsService = async (userId, username, isAdmin) => {
    if (isAdmin) {
        await getUserByIdRepository(userId);
    } 

    let sanitizedUsername
    if (username) {
        sanitizedUsername = username.trim().replace(/\s+/g, "").toLowerCase();
    } else {
        sanitizedUsername = "";
    }

    const receivedRequests = await getReceivedFriendRequestsRepository(userId, sanitizedUsername);
    
    return receivedRequests;
};