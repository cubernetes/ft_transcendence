// Defines the routes for tournaments
//
// GET /tournaments - Get all tournaments
// GET /tournaments/:id - Get tournament details

export default async function tournamentRoutes(fastify, options) {
    const { db } = options;
  
    // Get all tournaments
    fastify.get('/tournaments', async () => {
        try {
            const tournaments = await db.all('SELECT * FROM tournaments');
            return tournaments;
        } catch (error) {
            throw error;
        }
    });
  
    // Get tournament details
    fastify.get('/tournaments/:id', async (request) => {
        const { id } = request.params;
        try {
            const tournament = await db.get('SELECT * FROM tournaments WHERE id = ?', [id]);
            return tournament;
        } catch (error) {
            throw error;
        }
    });
}
  