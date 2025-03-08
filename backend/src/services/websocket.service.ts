import { WebSocket } from "ws";
import { FastifyBaseLogger } from "fastify";
// import type { GameState } from "../controllers/websocket.controller";
import type { Player, GameSession, GameState } from "../models/types";

export default class WebsocketService {
    private activeConnections: Map<number, WebSocket>;
    private gameSessions: Map<string, GameSession>;  // Track game sessions

    constructor(private readonly log: FastifyBaseLogger) {
        this.activeConnections = new Map();
        this.gameSessions = new Map();
    }

    registerConnection(conn: WebSocket, id: number, gameId: string) {
        this.log.info(`Registering connection for user ${id}`);
        this.activeConnections.set(id, conn);

        // Ensure a game session exists
        if (!this.gameSessions.has(gameId)) {
            this.gameSessions.set(gameId, {
                gameId,
                players: new Map<string, Player>(),  // Initialize as a Map
                state: {
                    ballPosition: { x: 50, y: 50 },
                    paddlePosition: {
                        "player-1": { y: 50 },
                        "player-2": { y: 50 },
                    },
                    score: { player1: 0, player2: 0 },
                },
            });
        }

        // Add the player to the session
        const session = this.gameSessions.get(gameId)!;
        
        // Assign player-1 or player-2 dynamically based on the number of players
        const playerKey = session.players.size === 0 ? "player-1" : "player-2"; // First player gets "player-1", second gets "player-2"

        session.players.set(id.toString(), { socket: conn, playerId: id.toString() });

        // Initialize paddle position based on the player assigned
        session.state.paddlePosition[playerKey] = { y: 50 };

        // Log the game state and player IDs
        this.log.info(`Game state after registering player ${id}: ${JSON.stringify(session.state)}`);
        this.log.info(`Players in game ${gameId}: ${[...session.players.keys()].join(", ")}`);
    }

    // Removes a player from the game session
    removePlayerFromGame(gameId: string, userId: number) {
        const session = this.gameSessions.get(gameId);
        if (session) {
            session.players.delete(userId.toString());
            this.log.info(`Player ${userId} removed from game ${gameId}`);
            if (session.players.size === 0) {
                this.gameSessions.delete(gameId);
                this.log.info(`Game session ${gameId} deleted as there are no players left`);
            }
        }
    }

    getGameState(gameId: string): GameState | null {
        return this.gameSessions.get(gameId)?.state || null;
    }

    updateGameState(gameId: string, newState: GameState) {
        if (this.gameSessions.has(gameId)) {
            this.gameSessions.get(gameId)!.state = newState;
        }
    }

    dropConnection(id: number) {
        this.log.info(`Dropping connection for user ${id}`);
        this.activeConnections.delete(id);
    }

    /**
     * "Routes" the message based on the type of some sort?
     * @param socket
     * @param msg
     */
    handleMessage(conn: WebSocket, msg: string, gameId: string) {
        const session = this.gameSessions.get(gameId);
        if (!session) {
            this.log.error(`Game session ${gameId} not found.`);
            return;
        }

        // Log the entire game state for debugging
        this.log.info(`gameState for game ${gameId}: ${JSON.stringify(session.state)}`);

        const gameState = session.state;
        const playerId = [...session.players.entries()]
            .find(([_, player]) => player.socket === conn)?.[0];
        
        if (!playerId) {
            this.log.warn("Unrecognized player tried to send a message.");
            return;
        }

        // Dynamically determine the player key
        const playerKey = `player-${session.players.size === 1 ? "1" : "2"}`; // Determine player-1 or player-2 based on session size

        // Log the playerId for debugging
        this.log.info(`Player ID for the connection: ${playerId}`);


        // Log paddle position for this player
        this.log.info(`Paddle positions in gameState: ${JSON.stringify(gameState.paddlePosition)}`);
        this.log.info(`Checking if playerKey ${playerKey} exists in paddlePosition`);

        // Check if the playerKey exists in paddlePosition
        if (!gameState.paddlePosition[playerKey]) {
            this.log.error(`Paddle position for player ${playerKey} not found in gameState.paddlePosition.`);
            return;
        }

        this.log.info(`Player ${playerKey} paddle position: ${JSON.stringify(gameState.paddlePosition[playerKey])}`);

        type Action = "move up" | "move down";

        const actions: Record<Action, (playerKey: string, gameState: GameState) => void> = {
            "move up": (playerKey: string, gameState: GameState) => {
                this.log.info(`${playerKey} wants to move paddle up`);	
                if (gameState.paddlePosition[playerKey].y > 0) {
                    gameState.paddlePosition[playerKey].y -= 10;
                }
            },
            "move down": (playerKey: string, gameState: GameState) => {
                this.log.info(`${playerKey} wants to move paddle down`);
                if (gameState.paddlePosition[playerKey].y < 300) {
                    gameState.paddlePosition[playerKey].y += 10;
                }
            },
        };
        // Log action being sent
        this.log.info(`Received action: ${msg}`);

        if (actions[msg as Action]) {
            actions[msg as Action](playerKey, gameState);
        }

        // Broadcast updated state to all players in the session
        Object.values(session.players).forEach(({ socket }) => {
            socket.send(JSON.stringify(gameState));
        });
    }
}
