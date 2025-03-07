import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import initDatabase from "./model/database";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Service, { ServiceInstance } from "./services/_index";
import routes from "./routes/_index";

export default class App {
  private server: FastifyInstance;
  private db: BetterSQLite3Database;
  private service: ServiceInstance;

  constructor() {
    this.server = Fastify({ logger: true });
    this.db = initDatabase();
    this.service = new Service(this.db);
  }

  private registerRoutes(server: FastifyInstance) {
    server.register(routes.user, {
      prefix: "/users",
      service: this.service,
    });
    server.register(routes.game, {
      prefix: "/games",
      service: this.service,
    });
    server.register(routes.tournament, {
      prefix: "/tournaments",
      service: this.service,
    });
    server.register(routes.friend, {
      prefix: "/friends",
      service: this.service,
    });
  }

  private registerCors(server: FastifyInstance) {
    server.register(cors, { origin: "*" }); // TODO: Use env variable to switch between production & development?
  }

  private async init() {
    try {
      this.registerCors(this.server);
      this.registerRoutes(this.server);
    } catch (error) {
      console.error("Error initializing server:", error);
      // this.server.log.error("Error initializing server:", error);
      process.exit(1);
    }
  }

  public async start(port: number) {
    await this.init();

    try {
      await this.server.listen({ port: 3000, host: "0.0.0.0" });
      this.server.log.info(`Server running at port ${port}!`);
    } catch (error) {
      this.server.log.error("Error starting server:", error);
      process.exit(1);
    }
  }
}
