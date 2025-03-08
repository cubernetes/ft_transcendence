import { users } from "./schema";
import { AppInstance } from "../app";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export const seed = async (app: AppInstance, db: BetterSQLite3Database) => {
    app.log.info(`Seed database with initial data...`);
    await db.insert(users).values([
        {
            username: "Timo",
            displayName: "Timo",
            passwordHash: "123",
        },
        {
            username: "Darren",
            displayName: "Darren",
            passwordHash: "123",
        },
        {
            username: "Ben",
            displayName: "Ben",
            passwordHash: "123",
        },
        {
            username: "John",
            displayName: "John",
            passwordHash: "123",
        },
        {
            username: "Sonia",
            displayName: "Sonia",
            passwordHash: "123",
        },
        {
            username: "Timo2",
            displayName: "Timo",
            passwordHash: "123",
        },
        {
            username: "Darren2",
            displayName: "Darren",
            passwordHash: "123",
        },
        {
            username: "Ben2",
            displayName: "Ben",
            passwordHash: "123",
        },
        {
            username: "John2",
            displayName: "John",
            passwordHash: "123",
        },
        {
            username: "Sonia2",
            displayName: "Sonia",
            passwordHash: "123",
        },
    ]);
};
