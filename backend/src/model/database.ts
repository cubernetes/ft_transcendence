import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { seed } from "./seed";

// Initialize database
const initDatabase = async (): Promise<BetterSQLite3Database> => {
  console.log("DB_PATH", process.env.DB_PATH);
  // Create database file if it doesn't exist
  const db = new Database(process.env.DB_PATH); // Maybe throw error if not found

  try {
    const drizzleDB = drizzle(db);
    seed(drizzleDB);
    // TODO: Fix type
    migrate(drizzleDB as any, {
      migrationsFolder: "./drizzle",
    });

    return drizzleDB;
  } catch (error) {
    db.close();
    console.error("Database setup error details:", error); // Add detailed error logging

    throw new Error("Database setup failed");
  }
};

export default initDatabase;
