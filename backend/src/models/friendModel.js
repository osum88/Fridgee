import prisma from "../utils/prisma.js";

export const createFriendshipService = async (senderId, receiverId) => {
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

export const getStatusFriendshipService = async (senderId, receiverId) => {
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

export const getFriendshipService = async (senderId, receiverId) => {
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


export const updateFriendshipStatusService = async (senderId, receiverId, status) => {
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

export const deleteFriendshipService = async (senderId, receiverId) => {
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

export const deleteAllFriendshipService = async (userId) => {
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