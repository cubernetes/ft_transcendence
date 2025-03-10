import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { users } from "../models/schema";
import { CustomError, NotFoundError } from "../utils/errors";
import { User, UserInsert } from "../models/types";

export default class UserService {
    constructor(private readonly db: BetterSQLite3Database) {}

    async findAll(): Promise<User[]> {
        try {
            return await this.db.select().from(users);
        } catch (error) {
            console.error(`Error fetching all users:`, error);
            throw new CustomError(`Failed to fetch users`);
        }
    }

    async findById(id: number): Promise<User> {
        try {
            const user = await this.db.select().from(users).where(eq(users.id, id));
            if (!user || user.length === 0) throw new NotFoundError(`User not found`);

            return user[0];
        } catch (error) {
            console.error(`Error fetching user ${id}: `, error);
            throw new CustomError(`Failed to find user by id ${id}`);
        }
    }

    async findByUsername(username: string): Promise<User> {
        try {
            const user = await this.db.select().from(users).where(eq(users.username, username));
            if (!user || user.length === 0) throw new NotFoundError(`User not found`);

            return user[0];
        } catch (error) {
            console.error(`Error fetching user ${username}:`, error);
            throw new CustomError(`Failed to find user by username ${username}`);
        }
    }

    async create(userData: UserInsert): Promise<User> {
        try {
            // TODO: Check if database validation (no dup name, etc.) is required here
            const result = await this.db.insert(users).values(userData);
            return this.findById(Number(result.lastInsertRowid));
        } catch (error) {
            console.error(`Error creating user:`, error);
            throw new CustomError(`Failed to create user`);
        }
    }

    async update(id: number, userData: Partial<UserInsert>) {
        try {
            // TODO: Obviously some validation logic on other layers
            await this.db.update(users).set(userData).where(eq(users.id, id));
            return this.findById(id);
        } catch (error) {
            console.error(`Error updating user ${id}:`, error);
            throw new CustomError(`Failed to update user`);
        }
    }

    async delete(id: number) {
        id;
    }
}
