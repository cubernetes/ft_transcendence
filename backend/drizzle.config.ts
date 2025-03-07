import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/model/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "./drizzle/db.sqlite",
  },
});
