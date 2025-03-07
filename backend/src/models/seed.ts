import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { users } from "./schema";

export const seed = async (db: BetterSQLite3Database) => {
  await db.insert(users).values([
    {
      username: "Timo",
      displayName: "Alice",
      passwordHash: "123",
      salt: "123",
    },
    {
      username: "Darren",
      displayName: "Bob",
      passwordHash: "123",
      salt: "123",
    },
    {
      username: "Ben",
      displayName: "Bob",
      passwordHash: "123",
      salt: "123",
    },
    {
      username: "John",
      displayName: "Bob",
      passwordHash: "123",
      salt: "123",
    },
    {
      username: "Sonia",
      displayName: "Bob",
      passwordHash: "123",
      salt: "123",
    },
  ]);
};
