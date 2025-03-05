import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { users } from "../database/schema";

export default class UserService {
  private db: BetterSQLite3Database;

  constructor(db: BetterSQLite3Database) {
    this.db = db;
  }

  async findAll() {
    try {
      return await this.db.select().from(users);
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw new Error("Failed to fetch users");
    }
  }

  async findById(id: number) {
    try {
      const user = await this.db.select().from(users).where(eq(users.id, id));
      if (!user || user.length === 0) {
        throw new Error("User not found");
      }
      return user[0];
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      throw error;
    }
  }

  async create() {}

  async update(id: number) {
    id;
  }

  async delete(id: number) {
    id;
  }
}
