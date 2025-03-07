import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import { games } from "../model/schema";

export default class GameService {
  private db: BetterSQLite3Database;

  constructor(db: BetterSQLite3Database) {
    this.db = db;
  }

  async findAll() {
    try {
      return await this.db.select().from(games);
    } catch (error) {
      console.error("Error fetching all games:", error);
      throw new Error("Failed to fetch games");
    }
  }

  async findById(id: number) {
    try {
      const game = await this.db.select().from(games).where(eq(games.id, id));
      if (!game || game.length === 0) {
        throw new Error("Game not found");
      }
      return game[0];
    } catch (error) {
      console.error(`Error fetching game ${id}:`, error);
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
