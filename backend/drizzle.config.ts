import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle/migrations",
  schema: "./src/models/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./drizzle/db.sqlite",
  },
});
