const getFriendshipUserIds = (req) => {
    const actingUserId = req.user.id;
    const isAdmin = req.user.isAdmin;

    if (isAdmin) {                          //pro adminy
        const { user1Id, user2Id } = req.body;
        
        if (!user1Id || !user2Id) {
            throw new Error("For admin, both user1Id and user2Id are required.");
        }
        
        const user1 = parseInt(user1Id, 10);
        const user2 = parseInt(user2Id, 10);
        
        if (isNaN(user1) || isNaN(user2)) {
            throw new Error("User IDs must be numbers.");
        }

        return { user1, user2 };

    } else {                    //pro bezne uzivatele
        const friendId = parseInt(req.body.friendId || req.params.id, 10);
        
        if (isNaN(friendId)) {
            throw new Error("Invalid friend ID provided.");
        }
        
        return { user1: actingUserId, user2: friendId };
    }
};

export default getFriendshipUserIds;