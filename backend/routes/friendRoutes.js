// Defines the routes for friend requests and friendships
//
// GET /friends/:userId - Get all friends details for a specific user: id, username, and avatar_url
// POST /friends - Send friend request: If there is already a pending friend request /friendship between the
//  two users, return an error. Otherwise, insert a new friend request into the database.
// PUT /friends/accept - Accept friend request

export default async function friendRoutes(fastify, options) {
    const { db } = options;
  
    // Get all friends details for a specific user: id, username, and avatar_url
    fastify.get('/friends/:userId', async (request, reply) => {
        const { userId } = request.params;
        try {
            // Fetch friends where userId is either the smaller (user1_id) or larger (user2_id)
            const friends = await db.all(
                `SELECT 
                    CASE 
                        WHEN user1_id = ? THEN user2_id
                        ELSE user1_id
                    END AS friend_id
                FROM friends 
                WHERE user1_id = ? OR user2_id = ?`,
                [userId, userId, userId]
            );
            
            // Fetch the user details for each friend_id
            const friendsDetails = await Promise.all(friends.map(async (friend) => {
                const friendDetails = await db.get('SELECT id, username, avatar_url FROM users WHERE id = ?', [friend.friend_id]);
                return friendDetails;
            }));

            return reply.send(friendsDetails);
        } catch (error) {
            return reply.code(500).send({ error: 'Database error' });
        }
    });

    // Send friend request: If there is already a pending friend request /friendship between the 
    //  two users, return an error. Otherwise, insert a new friend request into the database.
    fastify.post('/friends', async (request, reply) => {
        const { user1_id, user2_id } = request.body;
    
        // Validate that user1_id and user2_id are different
        if (user1_id === user2_id) {
            return reply.code(400).send({ error: 'Users cannot send friend requests to themselves' });
        }
    
        // Ensure user1_id is the smaller ID
        const [smallerId, largerId] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
    
        try {
            // Check if the two users are already friends (status = 'accepted')
            const existingFriendship = await db.get(
                `SELECT * FROM friends WHERE 
                    (user1_id = ? AND user2_id = ?) OR 
                    (user1_id = ? AND user2_id = ?) 
                    AND status = 'accepted'`, 
                [smallerId, largerId, largerId, smallerId]
            );
        
            if (existingFriendship) {
                return reply.code(400).send({ error: 'Users are already friends' });
            }

            // Check if there is already a pending friend request (either way)
            const existingRequest = await db.get(
                `SELECT * FROM friends WHERE 
                    (user1_id = ? AND user2_id = ?) 
                    AND status = 'pending'`, 
                [smallerId, largerId]
            );
    
            if (existingRequest) {
                return reply.code(400).send({ error: 'Friend request already pending' });
            }
    
            // If no existing request, insert the new friend request
            await db.run(
                'INSERT INTO friends (user1_id, user2_id, status) VALUES (?, ?, ?)',
                [smallerId, largerId, 'pending']
            );
            
            return reply.code(201).send({ success: true, message: 'Friend request sent successfully' });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Database error' });
        }
    });
  
    // Accept friend request
    fastify.put('/friends/accept', async (request) => {
        const { user1_id, user2_id } = request.body;
    
        // Ensure user1_id is always smaller than user2_id
        const [smallerId, largerId] = user1_id < user2_id ? [user1_id, user2_id] : [user2_id, user1_id];
    
        try {
            // Update the status to 'accepted' with the correct order
            await db.run(
                'UPDATE friends SET status = ? WHERE user1_id = ? AND user2_id = ?',
                ['accepted', smallerId, largerId]
            );
            return { success: true };
        } catch (error) {
            throw error;
        }
    });
}
