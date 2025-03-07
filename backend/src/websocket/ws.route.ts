import { GameSession } from './game.types';
// import { WebSocket } from '@fastify/websocket';
import { FastifyInstance } from 'fastify';

// Game session storage
let gameSessions: { [gameId: string]: GameSession } = {};

export default async function (fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket, _req) => {
    fastify.log.info("New WebSocket connection");

    // Generate a unique player ID
    const playerId = `player-${Date.now()}`;

    // We can now assign this player to a game (creating a new session or joining an existing one)
    let gameSession: GameSession | null = null;

    // Join or create a new game
    if (Object.keys(gameSessions).length === 0) {
      // Create a new game session
      const gameId = `game-${Date.now()}`;
      gameSession = {
        gameId,
        players: {
          [playerId]: { socket, playerId },
        },
        state: {
          ballPosition: { x: 0, y: 0 }, // Initialize ball position
          score: { player1: 0, player2: 0 }, // Initialize score
          paddlePosition: { [playerId]: 'up' }, // Initialize paddle position for the player
        },
      };
      gameSessions[gameId] = gameSession;
      socket.send(`You joined a new game: ${gameId}`);
    } else {
      // Join an existing game (for simplicity, join the first game)
      const firstGameId = Object.keys(gameSessions)[0];
      gameSession = gameSessions[firstGameId];
      gameSession.players[playerId] = { socket, playerId };
      
      // Initialize paddle position for the new player
      if (!gameSession.state.paddlePosition) {
        gameSession.state.paddlePosition = {};
      }
      gameSession.state.paddlePosition[playerId] = 'up'; // Default paddle position for new player

      socket.send(`You joined game: ${firstGameId}`);
    }

    // Handle incoming messages from players
    socket.on('message', (message: string) => {
      fastify.log.info(`Received: ${message}`);

      if (message === 'startPong') {
        startGame(gameSession);
      } else if (message.startsWith('move')) {
        const direction = message.split(' ')[1];
        movePaddle(gameSession, playerId, direction);
      }
    });

    socket.on('ping', () => {
      fastify.log.info("Ping received!");
      socket.pong();
    });

    socket.on('close', () => {
      fastify.log.info("WebSocket socket closed");

      // Remove player from game session upon disconnection
      if (gameSession) {
        delete gameSession.players[playerId];

        // If no players are left in the game, remove the game session
        if (Object.keys(gameSession.players).length === 0) {
          delete gameSessions[gameSession.gameId];
        }
      }
    });

    // Send initial message to verify the socket
    socket.send("Welcome to the WebSocket Pong game server!");

    // Helper functions for game logic
    function startGame(session: GameSession) {
      // Assign players, store session info (e.g., gameId)
      fastify.log.info(`Game started! Game ID: ${session.gameId}`);

      // Notify all players in the game
      Object.values(session.players).forEach(player => {
        player.socket.send("Game started! Move your paddle with 'move up' or 'move down'");
      });

      // Initialize game state (e.g., ball position, score)
      session.state = {
        ballPosition: { x: 0, y: 0 },
        score: { player1: 0, player2: 0 },
        paddlePosition: session.state.paddlePosition || {}, // Ensure paddlePosition exists
      };
    }

    function movePaddle(session: GameSession, playerId: string, direction: string) {
      const player = session.players[playerId];
      
      // Ensure paddlePosition is initialized before updating
      if (!session.state.paddlePosition) {
        session.state.paddlePosition = {}; // Initialize if undefined
      }
      
      // Handle paddle movement logic (update game state)
      if (direction === 'up') {
        session.state.paddlePosition[playerId] = 'up';
      } else if (direction === 'down') {
        session.state.paddlePosition[playerId] = 'down';
      }

      // Respond to the player
      player.socket.send(`Paddle moved ${direction}`);

      // Optionally, broadcast the game state to all players
      Object.values(session.players).forEach(player => {
        player.socket.send(`Game state updated: ${JSON.stringify(session.state)}`);
      });
    }
  });
}
