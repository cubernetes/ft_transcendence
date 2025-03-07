
import { WebSocket } from '@fastify/websocket';

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
        paddlePosition?: { [playerId: string]: 'up' | 'down' }; // Optional, depending on your logic
    };
};
  