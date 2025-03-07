import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";

export type Player = {
  socket: WebSocket;
  playerId: string;
};

export type GameSession = {
  gameId: string;
  players: { [playerId: string]: Player };
  state: {
    ballPosition: { x: number; y: number };
    score: { player1: number; player2: number };
    paddlePosition?: { [playerId: string]: "up" | "down" }; // Optional, depending on your logic
  };
};

const websocketRoutes = async (fastify: FastifyInstance) => {
  // Store the initial game state
  let gameState = {
    ballPosition: { x: 50, y: 50 }, // Example ball position (center of the field)
    paddlePosition: {
      "player-1": { y: 50 }, // Example initial position for player 1
      "player-2": { y: 50 }, // Example initial position for player 2
    },
    score: { player1: 0, player2: 0 },
  };

  fastify.get("/", { websocket: true }, (socket, _req) => {
    console.log("New WebSocket connection");

    // Send initial game state to the client
    socket.send(JSON.stringify(gameState));

    socket.on("message", (message: string) => {
      const textMessage = message.toString();
      console.log("Message from client:", textMessage);

      if (message === "move up") {
        // Move player 1's paddle up
        console.log("Player 1 wants to move paddle up");
        if (gameState.paddlePosition["player-1"].y > 0) {
          gameState.paddlePosition["player-1"].y -= 10; // Move paddle up
        }
      } else if (message === "move down") {
        // Move player 1's paddle down
        console.log("Player 1 wants to move paddle down");
        if (gameState.paddlePosition["player-1"].y < 100) {
          gameState.paddlePosition["player-1"].y += 10; // Move paddle down
        }
      }

      // Respond back to the client with the updated game state
      socket.send(JSON.stringify(gameState));
    });

    socket.on("ping", () => {
      console.log("Ping received!");
      socket.pong();
    });

    socket.on("close", () => {
      console.log("WebSocket connection closed");
    });
  });
};

export default websocketRoutes;
