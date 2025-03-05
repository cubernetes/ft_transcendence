import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import path from "path";
import { promises as fs } from "fs";
import { fileURLToPath } from "url";

const initDatabase = async (): Promise<BetterSQLite3Database> => {
  const DB_DIR = "../../data";
  const DB_NAME = "database.sqlite";

  // Get the current file path (__dirname not available in ES modules)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const DB_DIR_PATH = path.resolve(__dirname, DB_DIR);

  // Ensure data directory exists
  try {
    await fs.mkdir(DB_DIR_PATH, { recursive: true });
  } catch (err) {
    throw new Error("Failed to initialize database directory!");
  }

  // Path constants
  const DB_PATH = path.join(DB_DIR_PATH, DB_NAME);
  const MIGRATIONS_PATH = path.resolve(__dirname, "./migrations");
  const SCHEMA_PATH = path.resolve(__dirname, "./schema.sql");
  const SEED_PATH = path.resolve(__dirname, "./seed.sql");

  // Check if database exists or not
  const dbExists = await fs
    .access(DB_PATH)
    .then(() => true)
    .catch(() => false);

  // Create database file if it doesn't exist
  const db = new Database(DB_PATH);

  // If database file doesn't exist, create tables from schema.sql
  try {
    if (!dbExists) {
      const schema = await fs.readFile(SCHEMA_PATH, "utf8");
      db.exec(schema);

      // Add seed data in development
      if (process.env.NODE_ENV === "development") {
        const seed = await fs.readFile(SEED_PATH, "utf8");
        db.exec(seed);
      }
    }

    // Always run migrations for any new changes, better-sqlite3 run only synchronously
    const drizzleDB = drizzle(db);
    migrate(drizzleDB, { migrationsFolder: MIGRATIONS_PATH });

    return drizzleDB;
  } catch (err) {
    db.close();
    throw new Error("Database setup failed!");
  }
};

export default initDatabase;
