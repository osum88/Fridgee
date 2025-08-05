const getFriendshipUserIds = (req) => {
    const currentUserId = req.user.id;
    const isAdmin = req.adminRoute;

    if (isAdmin) {                          //pro adminy
        const user1 = parseInt(req.params.id, 10);
        const user2 = parseInt(req.params.friendId, 10);
        
        if (!user1 || !user2) {
            throw new Error("For admin, both user1Id and user2Id are required.");
        }
        
        if (isNaN(user1) || isNaN(user2)) {
            throw new Error("User IDs must be numbers.");
        }

        return { user1, user2 };

    } else {                    //pro bezne uzivatele
        const friendId = parseInt(req.params.friendId, 10);
        
        if (isNaN(friendId)) {
            throw new Error("Invalid friend ID provided.");
        }
        
        return { user1: currentUserId, user2: friendId };
    }
};

export default getFriendshipUserIds;