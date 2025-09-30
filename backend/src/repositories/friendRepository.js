import prisma from "../utils/prisma.js";

//vytvori pratelstvi ve stavu PENDING
export const createFriendshipRepository = async (senderId, receiverId) => {
    try {
        if (senderId === receiverId) {
            throw new Error("Cannot send a friend request to yourself");
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });
        if (existingFriendship) {
            throw new Error("Friendship request or friendship already exists");
        }
        const newFriendShip = await prisma.friendship.create({
            data: {
                senderId: senderId,
                receiverId: receiverId,
            },
        });
        return newFriendShip;
    } catch (error) {
        console.error("Error creating friendship:", error);
        throw error;
    }
};

//vrati status pratelstvi
export const getStatusFriendshipRepository = async (senderId, receiverId) => {
    try {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            select: {
                status: true,
            },
        });
        return friendship?.status || null; 
    } catch (error) {
        console.error("Error getting friendship status:", error);
        throw error;
    }
};

//vrati pratelstvi
export const getFriendshipRepository = async (senderId, receiverId) => {
    try {
        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            select: {
                id: true,
                senderId: true,
                receiverId: true,
                status: true
            }
        });
        return friendship || null; 
    } catch (error) {
        console.error("Error getting friendship:", error);
        throw error;
    }
};

//updatuje friend status 
export const updateFriendshipStatusRepository = async (senderId, receiverId, status) => {
    try {
        const updatedFriendship = await prisma.friendship.updateMany({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
            data: {
                status: status,
            },
        });
        if (updatedFriendship.count === 0) {
            throw new Error("Friendship not found.");
        }
        return updatedFriendship;
    } catch (error) {
        console.error("Error updating friendship:", error);
        throw error;
    }
};

//smaze pratelstvi
export const deleteFriendshipRepository = async (senderId, receiverId) => {
    try {
        const deletedFriendships = await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { senderId: senderId, receiverId: receiverId },
                    { senderId: receiverId, receiverId: senderId },
                ],
            },
        });
        if (deletedFriendships.count === 0) {
            throw new Error("Friendship not found.");
        }
        return deletedFriendships;
    } catch (error) {
        console.error("Error deleting friendship:", error); 
        throw error;
    }
};

//smaze vsechny pratele
export const deleteAllFriendshipRepository = async (userId) => {
    try {
        const deletedFriendships = await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId },
                ],
            },
        });
        return deletedFriendships;
    } catch (error) {
        console.error("Error deleting all friendships for user:", error);
        throw error;
    }
};

//vyhleda pratele
export const getAllFriendsRepository = async (userId, searchUsername) => {
    try {
        const allFriends = await prisma.friendship.findMany({
            where: {
                OR: [
                    {
                        senderId: userId,
                        receiver: {
                            username: { contains: searchUsername, mode: "insensitive" },
                        },
                    },
                    {
                        receiverId: userId,
                        sender: {
                            username: { contains: searchUsername, mode: "insensitive" },
                        },
                    },
                ],
                status: "ACCEPTED",
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return allFriends;
    } catch (error) {
        console.error("Error getting all friends:", error);
        throw error;
    }
};

//vyhleda odeslane zadsoti o pratelstvi
export const getSentFriendRequestsRepository = async (userId, searchUsername) => {
    try {
        const sentRequests = await prisma.friendship.findMany({
            where: {
                senderId: userId,
                status: "PENDING",
                receiver: {        
                     username: { contains: searchUsername, mode: "insensitive" } 
                },
            },
            include: {
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return sentRequests;
    } catch (error) {
        console.error("Error getting sent requests:", error);
        throw error;
    }
};

//vyhleda prijate zadsoti o pratelstvi
export const getReceivedFriendRequestsRepository = async (userId, searchUsername) => {
    try {
        const receivedRequests = await prisma.friendship.findMany({
           where: {
                receiverId: userId,
                status: "PENDING",
                sender: {
                    username: { contains: searchUsername, mode: "insensitive" } 
                },
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        name: true,
                        surname: true,
                        profilePictureUrl: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        return receivedRequests;
    } catch (error) {
        console.error("Error getting receiver requests:", error);
        throw error;
    }
};

