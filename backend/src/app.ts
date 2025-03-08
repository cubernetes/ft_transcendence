import Fastify, { FastifyBaseLogger, FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import initDatabase from "./models/database";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Service, { ServiceInstance } from "./services";
import routes, { Route } from "./routes";
import jwt from "@fastify/jwt";
import WebsocketController from "./controllers/websocket.controller";
import { InternalServerError } from "./utils/errors";
import { appConfig } from "./config/app.config";

export default class App {
  server: FastifyInstance;
  log: FastifyBaseLogger;
  db: BetterSQLite3Database | undefined;
  service: ServiceInstance | undefined;

  /**
   * Dependency injection will make testing easier.
   */
  constructor(db?: BetterSQLite3Database) {
    this.server = Fastify(appConfig);
    this.log = this.server.log;
    this.db = db;
  }

  /**
   * Register all routes here.
   */
  private registerHttpRoutes(service: ServiceInstance) {
    const registerRoute = (route: Route, prefix: string) =>
      this.server.register(route, { prefix, service });

    registerRoute(routes.user, `/users`);
    registerRoute(routes.game, `/games`);
    registerRoute(routes.tournament, `/tournaments`);
    registerRoute(routes.friend, `/friends`);
  }

  private registerCors() {
    // TODO: Use env variable to switch between production & development?
    this.server.register(cors, { origin: "*" });
  }

  private registerJwt() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error(`JWT_SECRET environment variable is required`);

    // TODO: Add more options here for JWT, see: https://github.com/fastify/fastify-jwt
    this.server.register(jwt, { secret });
  }

  private async registerWs(service: ServiceInstance) {
    // Websocket has to be registered before the routes
    await this.server.register(websocket, { options: { maxPayload: 1048576 } });

    // Not exactly a route like REST, so leave it here for now
    const controller = new WebsocketController(service.websocket);
    this.server.get(
      "/ws",
      { websocket: true },
      controller.handleConnection.bind(controller)
    );

    // this.registerRoute(routes.websocket, '/wss');
  }

  private async init() {
    try {
      if (!this.db) this.db = await initDatabase(this);
      this.service = new Service(this, this.db);

      // Websocket has to be registered before the routes
      await this.registerWs(this.service);
      this.registerCors();
      this.registerJwt();
      this.registerHttpRoutes(this.service);
    } catch (error) {
      this.log.error({ err: error }, `Fail to initialize server`);
      throw new InternalServerError(`Fail to initialize server`);
    }
  }

  public async start(port: number) {
    try {
      await this.init();
      await this.server.listen({ port, host: "0.0.0.0" });
      this.log.info(`Server running at port ${port}!`);
    } catch (error) {
      this.log.error({ err: error }, `Fail to start server`);
      throw new InternalServerError(`Fail to start server`);
    }
  }
}

export type AppInstance = InstanceType<typeof App>;
