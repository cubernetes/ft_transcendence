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
