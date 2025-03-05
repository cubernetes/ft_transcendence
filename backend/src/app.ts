import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import initDatabase from "./database/index";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export default class App {
  private server: FastifyInstance;
  private db: BetterSQLite3Database | null = null;
  private initialized = false;

  constructor() {
    this.server = Fastify({ logger: true });
  }

  private async init() {
    if (this.initialized) return;

    this.db = await initDatabase();

    // Register CORS
    await this.server.register(cors, { origin: "*" }); // TODO: Use env variable to switch between production & development?

    // Register routes to fastify
    //await this.server.register(userRoutes, { db: this.db });

    this.initialized = true;
  }

  public async start(port: number) {
    await this.init();

    try {
      await this.server.listen({ port, host: "0.0.0.0" });
      this.server.log.info(`Server running at port ${port}!`);
    } catch (err) {
      this.server.log.error("Error starting server:", err);
      process.exit(1);
    }
  }

  public getServer() {
    return this.server;
  }

  public getDatabase() {
    if (!this.db) throw new Error("Database not initialized!");
    return this.db;
  }
}
