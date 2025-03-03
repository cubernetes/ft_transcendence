// Defines the routes for games
//
// GET /games - Get all games
// GET /games/:id - Get specific game details

export default async function gameRoutes(fastify, options) {
    const { db } = options;
  
    // Get all games
    fastify.get('/games', async () => {
        try {
            const games = await db.all('SELECT * FROM games');
            return games;
        } catch (error) {
            throw error;
        }
    });
  
    // Get specific game details
    fastify.get('/games/:id', async (request) => {
        const { id } = request.params;
        try {
            const game = await db.get('SELECT * FROM games WHERE id = ?', [id]);
            return game;
        } catch (error) {
            throw error;
        }
    });
}
  