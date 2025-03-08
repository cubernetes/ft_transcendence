import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { friends, games, tournaments, users } from "./schema";

export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type UserInsertBody = Omit<UserInsert, "passwordHash"> & {
    password: string;
};
export type UserLoginBody = Pick<UserInsertBody, "username" | "password">;

export type Game = InferSelectModel<typeof games>;
export type GameInsert = InferInsertModel<typeof games>;

export type Tournament = InferSelectModel<typeof tournaments>;
export type TournamentInsert = InferInsertModel<typeof tournaments>;

export type Friendship = InferSelectModel<typeof friends>;
export type FriendshipInsert = InferInsertModel<typeof friends>;


// TODO: Maybe move this to a separate file?
import { WebSocket } from "ws";

export type Player = {
    socket: WebSocket;
    playerId: string;
};

export type GameState = {
    ballPosition: { x: number; y: number };
    score: { player1: number; player2: number };
    paddlePosition: { [playerId: string]: { y: number } };
};

export type GameSession = {
    gameId: string;
    players: Map<string, Player>;
    state: GameState;
};
