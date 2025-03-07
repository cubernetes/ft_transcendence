import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import initDatabase from "./models/database";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Service, { ServiceInstance } from "./services";
import routes, { Route } from "./routes";

export default class App {
  private db: BetterSQLite3Database;
  private server: FastifyInstance;
  private service: ServiceInstance;

  constructor() {
    this.db = initDatabase();
    this.server = Fastify({ logger: true });
    this.service = new Service(this.db);
  }

  private register(route: Route, prefix: string) {
    this.server.register(route, {
      prefix,
      service: this.service,
    });
  }

  private registerRoutes() {
    this.register(routes.user, "/users");
    this.register(routes.game, "/games");
    this.register(routes.tournament, "/tournaments");
    this.register(routes.friend, "/friends");
  }

  private registerCors() {
    // TODO: Use env variable to switch between production & development?
    this.server.register(cors, { origin: "*" });
  }

  private async init() {
    try {
      this.registerCors();
      this.registerRoutes();
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
