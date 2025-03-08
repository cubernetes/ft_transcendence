import Database from "better-sqlite3";
import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { seed } from "./seed";
import path from "path";
import fs from "fs";
import { InternalServerError } from "../utils/errors";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { AppInstance } from "../app";

/**
 * Initialize database connection synchronously.
 * @returns Database connection
 */
const initDatabase = async (app: AppInstance): Promise<BetterSQLite3Database> => {
    const isDev = process.env.NODE_ENV === "development";
    const log = app.log;
    let sqlite: Database.Database | null = null;

    try {
        // Ensure DB_PATH is set
        const dbPath = process.env.DB_PATH;
        if (!dbPath) throw new Error("DB_PATH environment variable is not set");

        // Ensure the directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

        const dbExists = fs.existsSync(dbPath);

        // Create database connection, create one if doesn't exist
        sqlite = new Database(dbPath);
        const db = drizzle(sqlite);

        // If database is new, apply migrations (schema) and possibly seed with dummy data
        if (!dbExists) {
            log.info(`Apply database schema...`);
            migrate(db, { migrationsFolder: path.join(dbDir, "migrations") });

            if (isDev) await seed(app, db);
        }

        return db;
    } catch (error) {
        log.error(`Fail to initialize database: `, error);

        if (sqlite) {
            try {
                sqlite.close();
                log.info(`Database connection closed due to initialization failure`);
            } catch (closeError) {
                log.error({ err: closeError }, `Error while closing the database`);
            }
        }

        throw new InternalServerError(`Database initialization failed`);
    }
};

export default initDatabase;
