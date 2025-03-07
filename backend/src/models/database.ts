import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { seed } from "./seed";
import path from "path";
import fs from "fs";

// Initialize database synchronously
// better-sqlite3 is completely synchronous
const initDatabase = (): BetterSQLite3Database => {
  let sqlite: Database.Database | null = null;

  try {
    // Ensure DB_PATH is set
    if (!process.env.DB_PATH)
      throw new Error("DB_PATH environment variable is not set");

    // Ensure the directory exists
    const dbDir = path.dirname(process.env.DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Create database connection
    sqlite = new Database(process.env.DB_PATH, {
      verbose: process.env.NODE_ENV === "development" ? console.log : undefined,
    });

    // Create Drizzle ORM instance
    const db = drizzle(sqlite);

    // Run migrations
    migrate(db, {
      migrationsFolder: "./drizzle",
    });

    // Seed data in development
    if (process.env.NODE_ENV === "development") seed(db);

    console.log(`Database initialized successfully at ${process.env.DB_PATH}`);
    return db;
  } catch (error) {
    if (sqlite) {
      try {
        sqlite.close();
      } catch (closeError) {
        console.error("Error while closing database:", closeError);
      }
    }

    console.error("Database initialization failed:", error);
    throw new Error(
      error instanceof Error
        ? `Database initialization failed: ${error.message}`
        : "Database initialization failed"
    );
  }
};

export default initDatabase;
